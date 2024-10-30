
# Music Player App

This is a React Native app that lets users browse and play a selection of songs. Users can navigate between songs, view album art, and control playback with play, pause, next, and previous buttons.

## Features

- Play and pause songs with simple controls.
- Navigate between songs using next and previous buttons.
- Displays album art and song details (title and artist) for each track.
- Songs and their metadata are stored in a local SQLite database.
- A list view shows all available songs with quick access to play each one.

## Installation

### Prerequisites

Make sure you have the following tools installed on your machine:

- [Node.js](https://nodejs.org/en/) (v14 or later)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) globally installed
- [React Native development environment](https://reactnative.dev/docs/environment-setup) set up

If you haven’t installed Expo CLI yet, run:

```bash
npm install -g expo-cli
```

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Angelaestefan/MusicPlayerApp.git
   ```

2. Navigate into the project directory:

   ```bash
   cd MusicPlayerApp
   ```

3. Install dependencies:

   ```bash
   npm install
   expo install expo-av expo-sqlite @react-navigation/native @react-navigation/native-stack
   ```

4. Start the development server:

   ```bash
   expo start
   ```

### Technologies Used

- **React Native**: For building the user interface.
- **Expo**: To simplify the React Native development process.
- **Expo AV**: To handle audio playback.
- **Expo SQLite**: For storing song metadata locally.
- **React Navigation**: For easy navigation between the home and player screens.

### Usage

After launching the app, you’ll see a list of songs stored in the database. Tap on a song to navigate to the player screen, where you can view the album art and use playback controls to listen to your selected track.

---

![image](https://github.com/user-attachments/assets/9db9a9be-1539-4d52-9275-bcfba56ef50b)




Feel free to reach out if you encounter any issues or have questions regarding the app setup!
