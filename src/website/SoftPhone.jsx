import React, { useState, useEffect, useRef, useCallback } from "react";
import { Device } from "@twilio/voice-sdk";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Clock,
  Users,
  PhoneIncoming,
  PhoneOutgoing,
  Pause,
  Play,
  Settings,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { LuDelete } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import PhoneNumberDetails from "./numbers/PhoneNumberDetails";
import CallHistoryByNumber from "./numbers/CallHistoryByNumber";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Modal, Select } from "@mantine/core";
import { toast } from "react-toastify";
import { useDisclosure } from "@mantine/hooks";
import AddCallReport from "./numbers/components/AddCallReport";

const CALL_STATUS = {
  IDLE: "idle",
  CONNECTING: "connecting",
  RINGING: "ringing",
  CONNECTED: "connected",
  HOLD: "hold",
  ENDED: "ended",
};

const Softphone = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  // Core state
  const [device, setDevice] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [callStatus, setCallStatus] = useState(CALL_STATUS.IDLE);
  const [agentId, setAgentId] = useState(auth?.user?._id);
  const [agentName, setAgentName] = useState(auth?.user?.username);

  // UI state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [TwilioNumber, setTwilioNumber] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callId, setCallId] = useState("");
  const [callHistory, setCallHistory] = useState([]);
  const [isOnHold, setIsOnHold] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState("disconnected");
  const [addModal, { open: addOpen, close: addClose }] = useDisclosure(false);

  // Refs
  const deviceRef = useRef(null);
  const callTimerRef = useRef(null);

  // Fetch phone numbers with pagination and search
  const getPhoneNumbers = () => {
    return axios.get(`/phone-numbers`);
  };

  const {
    isLoading: loadingNumbers,
    data: numbersData,
    error: numbersError,
    isError: isNumbersError,
    refetch,
    isRefetching: refetchingNumbers,
  } = useQuery({
    queryFn: getPhoneNumbers,
    queryKey: [`phone-numbers`],
    keepPreviousData: true,
    retry: 2,
  });

  let numbers =
    numbersData?.data?.phoneNumbers?.map((number) => {
      const container = {};
      container.label = `${number?.name} - ${number?.phoneNumber}`;
      container.value = number?.phoneNumber;
      return container;
    }) || [];

  // Initialize Twilio Device
  const initializeDevice = useCallback(async () => {
    try {
      console.log("🔑 Getting access token...");
      const response = await axios.post("/calls/softphone/token", {
        agentId,
        agentName,
      });

      const { token } = response.data;

      const newDevice = new Device(token, {
        logLevel: 1,
        codecPreferences: ["opus", "pcmu"],
        enableRingingState: true,
        allowIncomingWhileBusy: false,
      });

      // Device event listeners
      newDevice.on("registered", () => {
        setDeviceStatus("registered");
      });

      newDevice.on("unregistered", () => {
        setDeviceStatus("unregistered");
      });

      newDevice.on("error", (error) => {
        setDeviceStatus("error");
      });

      newDevice.on("incoming", (call) => {
        // console.log(call?.parameters);
        setIncomingCall(call);
        if (call?.parameters?.From) {
          setTwilioNumber(call?.parameters?.From);
        }
        // setTwilioNumber(call?.parameters?.From)
        setupCallEventListeners(call);
      });

      newDevice.on("tokenWillExpire", async () => {
        console.log("🔄 Token expiring, refreshing...");
        try {
          const refreshResponse = await axios.post("/calls/softphone/token", {
            agentId,
            agentName,
          });
          newDevice.updateToken(refreshResponse.data.token);
        } catch (error) {
          console.error("❌ Failed to refresh token:", error);
        }
      });

      await newDevice.register();
      setDevice(newDevice);
      deviceRef.current = newDevice;
    } catch (error) {
      console.error("❌ Failed to initialize device:", error);
      setDeviceStatus("error");
    }
  }, [agentId, agentName]);

  // Setup call event listeners
  const setupCallEventListeners = useCallback((call) => {
    call.on("accept", () => {
      setCurrentCall(call);
      setCallStatus(CALL_STATUS.CONNECTED);
      setIncomingCall(null);
      startCallTimer();
    });

    call.on("disconnect", () => {
      setCallId(call?.parameters?.CallSid);
      console.log(callId);
      addOpen();
      setCurrentCall(null);
      setCallStatus(CALL_STATUS.ENDED);
      setIncomingCall(null);
      setIsOnHold(false);
      stopCallTimer();
      setTimeout(() => setCallStatus(CALL_STATUS.IDLE), 2000);
      fetchCallHistory();
    });

    call.on("cancel", () => {
      setCallId(call?.parameters?.CallSid);
      console.log(callId);
      addOpen();
      setIncomingCall(null);
      setCallStatus(CALL_STATUS.IDLE);
    });

    call.on("reject", () => {
      setCallId(call?.parameters?.CallSid);

      console.log(callId);
      addOpen();
      setIncomingCall(null);
      setCallStatus(CALL_STATUS.IDLE);
    });

    call.on("error", (error) => {
      setCallStatus(CALL_STATUS.ENDED);
      setTimeout(() => setCallStatus(CALL_STATUS.IDLE), 2000);
    });

    call.on("mute", (muted) => {
      setIsMuted(muted);
    });

    call.on("volume", (inputVolume, outputVolume) => {});
  }, []);

  // Call timer functions
  const startCallTimer = useCallback(() => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopCallTimer = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
  }, []);

  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getTwilioNumber = () => {
    return TwilioNumber;
  };

  // Make outbound call
  const makeCall = useCallback(async () => {
    if (!device || !phoneNumber.trim()) return;
    if (!TwilioNumber)
      return toast.error("Please select a Twilio number to call with");

    try {
      setCallStatus(CALL_STATUS.CONNECTING);

      const call = await device.connect({
        params: {
          To: phoneNumber.trim(),
          From: getTwilioNumber(),
        },
      });

      setupCallEventListeners(call);
      setCurrentCall(call);
      setCallStatus(CALL_STATUS.RINGING);
    } catch (error) {
      console.error("❌ Failed to make call:", error);
      setCallStatus(CALL_STATUS.ENDED);
      setTimeout(() => setCallStatus(CALL_STATUS.IDLE), 2000);
    }
  }, [device, phoneNumber, TwilioNumber, setupCallEventListeners]);

  // Answer incoming call
  const answerCall = useCallback(() => {
    if (incomingCall) {
      incomingCall.accept();
      setCallStatus(CALL_STATUS.CONNECTED);
    }
  }, [incomingCall]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    setCallId(currentCall?.parameters?.CallSid);
    addOpen();
    if (incomingCall) {
      incomingCall.reject();
    }
  }, [incomingCall]);

  // Hang up call
  const hangUpCall = useCallback(() => {
    setCallId(currentCall?.parameters?.CallSid);
    console.log(callId);
    addOpen();
    if (currentCall) {
      currentCall.disconnect();
    }
  }, [currentCall]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (currentCall) {
      const newMutedState = !isMuted;
      currentCall.mute(newMutedState);
      setIsMuted(newMutedState);
    }
  }, [currentCall, isMuted]);

  // Toggle hold
  const toggleHold = useCallback(() => {
    if (currentCall) {
      if (isOnHold) {
        // Resume call logic - depends on your implementation
        setIsOnHold(false);
      } else {
        // Hold call logic - depends on your implementation
        setIsOnHold(true);
      }
    }
  }, [currentCall, isOnHold]);

  // Set volume
  const setCallVolume = useCallback(
    (newVolume) => {
      if (currentCall) {
        setVolume(newVolume);
        // Set the output volume (0.0 to 1.0)
        currentCall.setVolume(newVolume / 100);
      }
    },
    [currentCall]
  );

  // Fetch call history
  const fetchCallHistory = useCallback(async () => {
    try {
      const response = await axios.get(`/record-calls/history`);
      setCallHistory(response.data.data?.calls || []);
    } catch (error) {
      console.error("❌ Failed to fetch call history:", error);
    }
  }, [agentId]);

  // Handle keypad input
  const handleKeypadInput = useCallback(
    (digit) => {
      if (callStatus === CALL_STATUS.IDLE) {
        setPhoneNumber((prev) => prev + digit);
      } else if (currentCall && callStatus === CALL_STATUS.CONNECTED) {
        console.log("📞 Sending DTMF:", digit);
        currentCall.sendDigits(digit);
      }
    },
    [callStatus, currentCall]
  );

  // Clear phone number
  const clearPhoneNumber = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  // Initialize device on mount
  useEffect(() => {
    initializeDevice();
    fetchCallHistory();

    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy();
      }
      stopCallTimer();
    };
  }, [initializeDevice, fetchCallHistory, stopCallTimer]);

  // Keypad component
  // Modern professional keypad component
  const Keypad = () => {
    const [activeKey, setActiveKey] = useState(null);

    const keys = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["+", "0", "#"],
    ];

    const handleKeyPress = (key) => {
      setActiveKey(key);
      handleKeypadInput(key);
      setTimeout(() => setActiveKey(null), 150);
    };

    return (
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {keys.flat().map((key) => (
            <button
              key={key}
              onClick={() => handleKeyPress(key)}
              disabled={
                callStatus === CALL_STATUS.CONNECTING ||
                callStatus === CALL_STATUS.RINGING
              }
              className={`
                relative h-14 w-14 rounded-xl font-bold text-lg
                bg-white border-2 border-gray-200 
                hover:border-blue-300 hover:bg-blue-50 hover:scale-105
                active:scale-95 active:bg-blue-100 active:border-blue-400
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                transition-all duration-150 ease-out
                shadow-sm hover:shadow-md
                text-gray-700 hover:text-blue-700
                ${
                  activeKey === key
                    ? "bg-blue-100 border-blue-400 scale-95"
                    : ""
                }
                ${
                  callStatus === CALL_STATUS.CONNECTED
                    ? "border-green-200 hover:border-green-300 hover:bg-green-50"
                    : ""
                }
              `}
            >
              <span className="relative z-10">{key}</span>

              {/* Subtle hover effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-blue-50/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-150" />

              {/* Active press ripple effect */}
              {activeKey === key && (
                <div className="absolute inset-0 rounded-xl bg-blue-200/30 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="">
      <Modal opened={addModal} title="Call Report" withcloseButton={false}>
        <AddCallReport callId={callId} closeModal={addClose} TwilioNumber={TwilioNumber} />
      </Modal>

      <div className="flex flex-col lg:flex-row justify-between mb-3 ">
        {/* phone */}
        <div className="w-full mx-auto">
          <div className="max-w-md mx-auto bg-white rounded-md shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Softphone</h2>
                  <p className="text-sm opacity-90">{agentName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      deviceStatus === "registered"
                        ? "bg-green-400"
                        : deviceStatus === "error"
                        ? "bg-red-400"
                        : "bg-yellow-400"
                    }`}
                  ></div>
                  <span className="text-sm">{deviceStatus}</span>
                </div>
              </div>
            </div>

            {/* Call Status Display */}
            {callStatus !== CALL_STATUS.IDLE && (
              <div className="bg-gray-50 p-4 border-b">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {callStatus === CALL_STATUS.CONNECTING && "Connecting..."}
                    {callStatus === CALL_STATUS.RINGING && "Ringing..."}
                    {callStatus === CALL_STATUS.CONNECTED &&
                      (currentCall?.parameters?.From || phoneNumber)}
                    {callStatus === CALL_STATUS.ENDED && "Call Ended"}
                  </div>
                  {callStatus === CALL_STATUS.CONNECTED && (
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {formatDuration(callDuration)}
                      </span>
                      {isOnHold && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          ON HOLD
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Incoming Call Alert */}
            {incomingCall && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PhoneIncoming className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Incoming Call
                      </p>
                      <p className="text-sm text-green-600">
                        {incomingCall.parameters?.From || "Unknown Number"}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={answerCall}
                      className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                    <button
                      onClick={rejectCall}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <PhoneOff className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Phone Number Input */}
            <div className="p-4">
              <label htmlFor="">Number To call</label>
              <div className="flex items-center border rounded-lg">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 p-3 border-none outline-none rounded-l-lg"
                  disabled={callStatus !== CALL_STATUS.IDLE}
                />
                {phoneNumber && (
                  <button
                    onClick={clearPhoneNumber}
                    className="p-3 text-gray-400 bg-gray-100 rounded-md hover:text-gray-600"
                    disabled={callStatus !== CALL_STATUS.IDLE}
                  >
                    <LuDelete size={23} />
                  </button>
                )}
              </div>
              <div className="mt-2">
                <label htmlFor="">Twilio Number to call with </label>
                <Select
                  data={numbers}
                  value={TwilioNumber ? TwilioNumber : null}
                  onChange={(value) => setTwilioNumber(value)}
                  size="lg"
                />
              </div>
            </div>

            {/* Keypad */}
            <Keypad />

            {/* Call Controls */}
            <div className="p-4 border-t bg-gray-50">
              {callStatus === CALL_STATUS.IDLE ? (
                <button
                  onClick={makeCall}
                  disabled={
                    !phoneNumber.trim() || deviceStatus !== "registered"
                  }
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <PhoneCall className="h-5 w-5" />
                  <span>Call</span>
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Primary call controls */}
                  <div className="flex justify-center space-x-4">
                    {callStatus === CALL_STATUS.CONNECTED && (
                      <>
                        <button
                          onClick={toggleMute}
                          className={`p-3 rounded-full transition-colors ${
                            isMuted
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {isMuted ? (
                            <MicOff className="h-5 w-5" />
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </button>

                        <button
                          onClick={toggleHold}
                          className={`p-3 rounded-full transition-colors ${
                            isOnHold
                              ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {isOnHold ? (
                            <Play className="h-5 w-5" />
                          ) : (
                            <Pause className="h-5 w-5" />
                          )}
                        </button>
                      </>
                    )}

                    <button
                      onClick={hangUpCall}
                      className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <PhoneOff className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Volume control */}
                  {callStatus === CALL_STATUS.CONNECTED && (
                    <div className="flex items-center space-x-2">
                      <VolumeX className="h-4 w-4 text-gray-500" />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) =>
                          setCallVolume(parseInt(e.target.value))
                        }
                        className="flex-1"
                      />
                      <Volume2 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 w-8">
                        {volume}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Call History */}
            {callHistory.length > 0 && (
              <div className="border-t">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Recent Calls
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {callHistory.slice(0, 5).map((call, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          {call.direction === "inbound" ? (
                            <PhoneIncoming className="h-3 w-3 text-blue-500" />
                          ) : (
                            <PhoneOutgoing className="h-3 w-3 text-green-500" />
                          )}
                          <span>{call.phoneNumber}</span>
                        </div>
                        <span className="text-gray-500">
                          {new Date(
                            call.callDetails?.startTime
                          ).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* number data */}
        <div className="w-full">
          <PhoneNumberDetails phoneNumber={TwilioNumber} />
        </div>
      </div>
      {/* number previus logs */}
      <div className="mt-4">
        <CallHistoryByNumber phoneNumber={TwilioNumber} />
      </div>
    </div>
  );
};

export default Softphone;
