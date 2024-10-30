// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as SQLite from 'expo-sqlite';
import { Audio } from 'expo-av';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Initialize database
const db = SQLite.openDatabaseSync('musicdb.db');

// Create tables
await db.execAsync(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS songs (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, artist TEXT NOT NULL, imageUrl TEXT NOT NULL, audioUrl TEXT NOT NULL, isLocal INTEGER);
  INSERT INTO songs (title, imageUrl, audioUrl, isLocal) VALUES ('APT', 'Bruno Mars & Rose', '/home/angiea/MusicPlayerApp/assets/APT.jpg', '/home/angiea/MusicPlayerApp/assets/APT.mp3', 1);
  
`);



// Home Screen Component
const HomeScreen = ({ navigation }) => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM songs',
        [],
        (_, { rows: { _array } }) => {
          if (_array.length === 0) {
            // Insert initial songs if database is empty
            initialSongs.forEach(song => {
              tx.executeSql(
                'INSERT INTO songs (title, artist, imageUrl, audioUrl, isLocal) VALUES (?, ?, ?, ?, ?)',
                [song.title, song.artist, song.imageUrl, song.audioUrl, song.isLocal]
              );
            });
            setSongs(initialSongs);
          } else {
            setSongs(_array);
          }
        }
      );
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => navigation.navigate('Player', { song: item })}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.thumbnailImage}
      />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.artistName}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Music Player</Text>
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={item => item.id?.toString()}
        style={styles.list}
      />
    </SafeAreaView>
  );
};

// Player Screen Component
const PlayerScreen = ({ route }) => {
  const { song } = route.params;
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    loadSongs();
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, []);

  const loadSongs = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM songs',
        [],
        (_, { rows: { _array } }) => {
          setSongs(_array);
          const index = _array.findIndex(s => s.id === song.id);
          setCurrentSongIndex(index);
        }
      );
    });
  };

  async function playSound() {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: songs[currentSongIndex].audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
    }
  }

  const playNext = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    const nextIndex = (currentSongIndex + 1) % songs.length;
    setCurrentSongIndex(nextIndex);
  };

  const playPrevious = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    const prevIndex = currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
  };

  return (
    <View style={styles.playerContainer}>
      <Image
        source={{ uri: songs[currentSongIndex]?.imageUrl }}
        style={styles.albumArt}
      />
      <Text style={styles.songTitle}>{songs[currentSongIndex]?.title}</Text>
      <Text style={styles.artistName}>{songs[currentSongIndex]?.artist}</Text>
      
      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrevious}>
          <Ionicons name="play-skip-back" size={32} color="black" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={playSound}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={48}
            color="black"
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={playNext}>
          <Ionicons name="play-skip-forward" size={32} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  songItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  songInfo: {
    marginLeft: 15,
  },
  playerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  albumArt: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 30,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 30,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artistName: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});