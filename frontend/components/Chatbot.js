import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { WebView } from "react-native-webview";

const Chatbot = () => {
  const [iframeUrl, setIframeUrl] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://fun-adversely-arachnid.ngrok-free.app/chatbot/session", { // http://fun-adversely-arachnid.ngrok-free.app/chatbot/session
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((res) => res.json())
      .then(({ url }) => {
        setIframeUrl(url);
      })
      .catch((error) => {
        console.error("Error fetching chatbot session URL:", error);
        setError(error);
      });
  }, []);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.errorText}>Error: {error.message}</Text>
      ) : iframeUrl ? (
        <WebView
          source={{ uri: iframeUrl }}
          style={styles.webview}
        />
      ) : (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  webview: {
    height: 640,
    width: 400,
  },
  loadingText: {
    fontSize: 18,
    color: "gray",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default Chatbot;