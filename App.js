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

const initialSongs = [
  {
    title: 'APT',
    artist: 'Bruno Mars & ROSÉ',
    imageUrl: require('./assets/APT.jpg'),
    audioUrl: 'APT.mp3',
    isLocal: 1
  },
  {
    title: 'Pink Pony Club',
    artist: 'Chappel Roan',
    imageUrl: require('./assets/pinkPonyClub.jpg'),
    audioUrl: 'APT.mp3',
    isLocal: 1
  },
  {
    title: 'Juno',
    artist: 'Sabrina Carpenter',
    imageUrl: require('./assets/juno.png'),
    audioUrl: 'APT.mp3',
    isLocal: 1
  },
  {
    title: 'Suivre le Soleil',
    artist: 'Vanille',
    imageUrl: require('./assets/suivreLeSoleil.jpg'),
    audioUrl: 'APT.mp3',
    isLocal: 1
  },
  
  
];

const initDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync('musicdb3.db');
    
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        audioUrl TEXT NOT NULL,
        isLocal INTEGER NOT NULL
      );
    `);

    const existingSongs = await db.getAllAsync('SELECT * FROM songs');
    if (existingSongs.length === 0) {
      for (const song of initialSongs) {
        await db.runAsync(
          'INSERT INTO songs (title, artist, imageUrl, audioUrl, isLocal) VALUES (?, ?, ?, ?, ?)',
          [song.title, song.artist, song.imageUrl, song.audioUrl, song.isLocal]
        );
      }
    }

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

const HomeScreen = ({ navigation }) => {
  const [songs, setSongs] = useState([]);
  const [db, setDb] = useState(null);

  useEffect(() => {
    const setupDatabase = async () => {
      const database = await initDatabase();
      setDb(database);
      loadSongs(database);
    };

    setupDatabase();
  }, []);

  const loadSongs = async (database) => {
    try {
      const allSongs = await database.getAllAsync('SELECT * FROM songs');
      setSongs(allSongs);
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => navigation.navigate('Player', { song: item })}
    >
      <Image
        // Parse the stored image reference
        source={item.isLocal ? JSON.parse(item.imageUrl) : { uri: item.imageUrl }}
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

const PlayerScreen = ({ route }) => {
  const { song } = route.params;
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [db, setDb] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const setupDatabase = async () => {
      const database = await initDatabase();
      setDb(database);
      loadSongs(database);
    };

    setupDatabase();

    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, []);

  const loadSongs = async (database) => {
    try {
      const allSongs = await database.getAllAsync('SELECT * FROM songs');
      setSongs(allSongs);
      const index = allSongs.findIndex(s => s.id === song.id);
      setCurrentSongIndex(index);
    } catch (error) {
      console.error('Error loading songs:', error);
    }
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
        songs[currentSongIndex].isLocal
          ? songs[currentSongIndex].audioUrl  // if local
          : { uri: songs[currentSongIndex].audioUrl }, // if remote
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
        source={
          songs[currentSongIndex]?.isLocal 
            ? JSON.parse(songs[currentSongIndex].imageUrl)
            : { uri: songs[currentSongIndex]?.imageUrl }
        }
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