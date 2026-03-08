# 🪷 SafeHer: The Predictive AI Guardian
**Built for the AWS AI for Bharat Hackathon**

> **The Problem:** Traditional safety apps are reactive. They require a victim to recognize a threat, unlock their phone, and press a button during a moment of panic or physical constraint. 
> 
> **The Solution:** SafeHer shifts personal safety from a manual response to an **autonomous prediction**. By utilizing an AWS-hosted central nervous system and edge-level Acoustic AI, SafeHer acts as a "Digital Sixth Sense," intervening to de-escalate threats before an incident even occurs.

---

## ✨ Key Features

* **🛡️ Stealth Tripwire (Acoustic AI):** Ambient background monitoring that utilizes NLP to detect rising vocal distress, screams, or environmental anomalies without the user ever touching their device.
* **📞 Context-Aware Smart Calls:** If the Risk Engine detects danger, the app autonomously synthesizes an AI voice call (e.g., "Parent Check-in" or "Cab Driver Interaction") to act as a visible deterrent.
* **🗺️ Area Intel & Secure Routing:** Bypasses standard navigation to calculate the "Safest Route" using real-time telemetry, crowd density metrics, and historical risk indices.
* **🚨 One-Slide SOS Dispatch:** A high-intent gesture that instantly broadcasts live GPS coordinates, audio snippets, and telemetry to a pre-defined Dispatch Network via our AWS backbone.

---

## 🧠 The Tri-Factor Risk Architecture
SafeHer determines safety not by guessing, but by calculating a dynamic Risk Score fused from three distinct data streams:
1. **Historical Crime Intelligence:** Geospatial risk heatmaps.
2. **Real-Time Environmental Context:** Time of day and location telemetry.
3. **Live Acoustic AI:** Edge-processed sound frequency and distress pattern recognition.

---

## 🏗️ Technical Stack

### **Frontend (Mobile App)**
* **Framework:** React Native (Expo)
* **State Management:** React Context API
* **Mapping:** React Native Maps

### **Backend & Cloud (AWS)**
* **Compute:** AWS EC2 (Ubuntu) running Node.js & Express
* **Database:** MongoDB Atlas (Secure storage for user profiles and Dispatch Networks)
* **Networking:** AWS Security Groups (Port 5000), RESTful API Architecture

### **AI & Intelligence**
* **Generative Voice:** ElevenLabs API for high-fidelity, contextual deterrent calls.
* **Edge AI:** Lightweight acoustic analysis running locally to ensure user privacy and zero-latency response.

---

## 🚀 Installation & Local Setup

### Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME
Frontend Setup (React Native)
cd frontend
npm install
npx expo start
Scan the QR code with the Expo Go app on your physical device to test the AI sensors.

---
**🔮 Future Roadmap**

**While the current prototype successfully implements the Acoustic AI and AWS Cloud Dispatch, our production roadmap includes:**

* **Historical Data Integration: Connecting Open Government Data APIs for granular street-level threat mapping.**

* **AWS Serverless Migration: Shifting the Node.js API to AWS Lambda for infinite scale and zero-idle costs.**

* **Wearable Integration: Syncing smartwatch biometrics (heart rate spikes) directly into the Tri-Factor Risk Engine.**
