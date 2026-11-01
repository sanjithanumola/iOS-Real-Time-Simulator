import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  addDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CallSession, IceCandidateData } from '../types/ios';
import { soundService } from './soundService';

const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private activeCallUnsub: Unsubscribe | null = null;
  private candidatesUnsub: Unsubscribe | null = null;
  private currentCallId: string | null = null;

  public onRemoteStream?: (stream: MediaStream) => void;
  public onLocalStream?: (stream: MediaStream) => void;
  public onCallEnded?: () => void;
  public onCallConnected?: () => void;

  // Get local media stream (audio only or video+audio)
  async getLocalMedia(callType: 'audio' | 'video'): Promise<MediaStream> {
    if (this.localStream) {
      this.stopLocalMedia();
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      if (this.onLocalStream) {
        this.onLocalStream(stream);
      }
      return stream;
    } catch (err) {
      console.warn('Microphone/Camera permission not granted or unavailable:', err);
      // Fallback: create silent audio track so WebRTC connection can still negotiate
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const dst = osc.connect(ctx.createMediaStreamDestination());
      osc.start();
      const fallbackStream = (dst as MediaStreamAudioDestinationNode).stream;
      this.localStream = fallbackStream;
      return fallbackStream;
    }
  }

  // Initialize RTCPeerConnection
  private initPeerConnection(callId: string, currentUserId: string, role: 'caller' | 'receiver') {
    this.peerConnection = new RTCPeerConnection(rtcConfig);
    this.remoteStream = new MediaStream();

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    // Handle remote tracks
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        if (this.remoteStream) {
          this.remoteStream.addTrack(track);
        }
      });
      if (this.onRemoteStream && this.remoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // Connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection?.connectionState === 'connected') {
        if (this.onCallConnected) this.onCallConnected();
      } else if (
        this.peerConnection?.connectionState === 'disconnected' ||
        this.peerConnection?.connectionState === 'failed' ||
        this.peerConnection?.connectionState === 'closed'
      ) {
        this.endCall();
      }
    };

    // Send local ICE candidates to Firestore
    this.peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        try {
          const candidatesRef = collection(db, 'calls', callId, 'candidates');
          const candPayload: IceCandidateData = {
            candidate: event.candidate.toJSON(),
            senderId: currentUserId,
            type: role,
            timestamp: new Date().toISOString(),
          };
          await addDoc(candidatesRef, candPayload);
        } catch (error) {
          console.error('Error adding ICE candidate:', error);
        }
      }
    };

    // Listen for remote ICE candidates
    const candidatesRef = collection(db, 'calls', callId, 'candidates');
    this.candidatesUnsub = onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as IceCandidateData;
          // Only add candidates from the other party
          if (data.senderId !== currentUserId && this.peerConnection) {
            try {
              await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch (err) {
              console.warn('Error adding received ice candidate:', err);
            }
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `calls/${callId}/candidates`);
    });
  }

  // Start outgoing call
  async startCall(
    caller: { uid: string; displayName: string; phoneNumber: string; photoURL?: string },
    receiver: { uid: string; displayName: string; phoneNumber: string },
    callType: 'audio' | 'video'
  ): Promise<string> {
    const callDocRef = doc(collection(db, 'calls'));
    const callId = callDocRef.id;
    this.currentCallId = callId;

    await this.getLocalMedia(callType);
    this.initPeerConnection(callId, caller.uid, 'caller');

    // Create SDP Offer
    const offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);

    const callData: CallSession = {
      id: callId,
      callerId: caller.uid,
      callerName: caller.displayName,
      callerPhone: caller.phoneNumber,
      callerPhoto: caller.photoURL || '',
      receiverId: receiver.uid,
      receiverName: receiver.displayName,
      receiverPhone: receiver.phoneNumber,
      callType,
      status: 'ringing',
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
      createdAt: new Date().toISOString(),
    };

    await setDoc(callDocRef, callData);

    // Listen to call document for answer / status change
    this.activeCallUnsub = onSnapshot(callDocRef, async (snapshot) => {
      const data = snapshot.data() as CallSession | undefined;
      if (!data) return;

      if (data.status === 'accepted' && data.answer && this.peerConnection?.signalingState !== 'stable') {
        const answerDesc = new RTCSessionDescription(data.answer);
        await this.peerConnection?.setRemoteDescription(answerDesc);
        soundService.stopRingtone();
      }

      if (data.status === 'declined' || data.status === 'ended') {
        this.endCall();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `calls/${callId}`);
    });

    return callId;
  }

  // Answer an incoming call
  async answerCall(callId: string, currentUserId: string, callType: 'audio' | 'video') {
    this.currentCallId = callId;
    soundService.stopRingtone();

    await this.getLocalMedia(callType);
    this.initPeerConnection(callId, currentUserId, 'receiver');

    const callDocRef = doc(db, 'calls', callId);

    // Get current call data to fetch offer
    this.activeCallUnsub = onSnapshot(callDocRef, async (snapshot) => {
      const data = snapshot.data() as CallSession | undefined;
      if (!data) return;

      if (data.offer && !this.peerConnection?.currentRemoteDescription) {
        await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await this.peerConnection?.createAnswer();
        if (answer) {
          await this.peerConnection?.setLocalDescription(answer);
          await updateDoc(callDocRef, {
            status: 'accepted',
            answer: {
              type: answer.type,
              sdp: answer.sdp,
            },
          });
        }
      }

      if (data.status === 'ended' || data.status === 'declined') {
        this.endCall();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `calls/${callId}`);
    });
  }

  // Decline incoming call
  async declineCall(callId: string) {
    soundService.stopRingtone();
    try {
      const callDocRef = doc(db, 'calls', callId);
      await updateDoc(callDocRef, {
        status: 'declined',
        endedAt: new Date().toISOString(),
      });
    } catch {}
    this.cleanUp();
  }

  // Hangup / end call
  async endCall() {
    soundService.stopRingtone();
    if (this.currentCallId) {
      try {
        const callDocRef = doc(db, 'calls', this.currentCallId);
        await updateDoc(callDocRef, {
          status: 'ended',
          endedAt: new Date().toISOString(),
        });
      } catch {}
    }
    this.cleanUp();
    if (this.onCallEnded) {
      this.onCallEnded();
    }
  }

  // Toggle microphone
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // true if muted
      }
    }
    return false;
  }

  // Toggle camera video
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Clean up WebRTC resources
  private cleanUp() {
    this.stopLocalMedia();

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.activeCallUnsub) {
      this.activeCallUnsub();
      this.activeCallUnsub = null;
    }

    if (this.candidatesUnsub) {
      this.candidatesUnsub();
      this.candidatesUnsub = null;
    }

    this.currentCallId = null;
  }

  private stopLocalMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  // Global incoming call listener for receiver
  static listenForIncomingCalls(receiverId: string, onIncomingCall: (call: CallSession) => void): Unsubscribe {
    const callsRef = collection(db, 'calls');
    const q = query(
      callsRef,
      where('receiverId', '==', receiverId),
      where('status', '==', 'ringing'),
      limit(1)
    );

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const callData = change.doc.data() as CallSession;
          if (callData.status === 'ringing') {
            soundService.startRingtone();
            onIncomingCall(callData);
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'calls');
    });
  }
}

export const webrtcService = new WebRTCService();
