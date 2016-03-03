# This script assumes yotta and its dependecies are already installed
# Make the workspace to compile an mbed linux client
mkdir -p test/bin
cd test/bin

# Clone the mbed-client-linux-example
git clone https://github.com/ARMmbed/mbed-client-linux-example.git
cd mbed-client-linux-example

# Replace the existing security.h with the unencrypted security.h
rm source/security.h
openssl aes-256-cbc -K $encrypted_0aeab6660007_key -iv $encrypted_0aeab6660007_iv -in ../../ci/security.h.enc -out source/security.h -d

# Set the yotta target and build
yt target x86-linux-native
yt build

# Ensure the application is executable
chmod +x build/x86-linux-native/source/mbed-client-linux-example