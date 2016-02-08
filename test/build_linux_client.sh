cd test/bin
git clone -b config-changes https://github.com/bridadan/mbed-client-linux-example.git
rm mbed-client-linux-example/source/security.h
openssl aes-256-cbc -K $encrypted_0aeab6660007_key -iv $encrypted_0aeab6660007_iv -in security.h.enc -out mbed-client-linux-example/source/security.h -d
cd mbed-client-linux-example
echo "{\"endpoint-lifetime\": 60}" > config.json
yt target x86-linux-native
yt build