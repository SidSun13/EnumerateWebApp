// Import necessary firebase and firestore + react
import './App.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  collection,
  orderBy,
  limit,
  query,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, getStorage, getDownloadURL, uploadBytes } from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { useEffect, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

// Component for the welcome page when user is not logged in
function WelcomePage({ signInWithGoogle }) {
  return (
    <div className="welcome-page">
      {/* Logo and Title */}
      <div className="logo-container">
        <img src="/logo.png" alt="" className="welcome-logo" />
        <h1 className="welcome-title">Enumerate</h1>
      </div>
      {/* Description */}
      <p className="welcome-description">
        Changing education one chat at a time.
      </p>
      {/* Information */}
      <p className="welcome-info">
        Enumerate is a chat application connecting students from all around the world. Just like Discord and Instagram are used for social gathering, Enumerate is used for educational gathering.
      </p>
      {/* Call to action */}
      <p className="welcome-join">
        Join Enumerate today to be a part of revitalizing education!
      </p>
      {/* Google Sign-In Button */}
      <button className="welcome-button" onClick={signInWithGoogle}>
        Log in with Google
      </button>
    </div>
  );
}

// Main App Component
function App() {
  const [user] = useAuthState(auth);
  const messageRef = collection(db, 'messages');
  const queryRef = query(
    messageRef,
    orderBy('createdAt', 'desc'),
    limit(25)
  );
  const [messages] = useCollection(queryRef, { idField: 'id' });

  const [formValue, setFormValue] = useState('');
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState([]);

  const scrollTo = useRef(null);

  const validFileTypes = [
    // List of valid file types for uploads
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'audio/mpeg',
    'video/mp4',
  ];

  // Handle tag input and add tags to the state
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      const newTag = e.target.value.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        e.target.value = '';
      }
    }
  };

  // Remove a tag from the state
  const removeTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  // Send a message with optional file attachment and tags
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!user) return;

    const payload = {
      text: formValue,
      createdAt: serverTimestamp(),
      uid: user.uid,
      photoURL: user.photoURL,
      fileURL: null,
      tags: [...tags], // Include selected tags in the payload
    };

    if (file) {
      const fileType = file.type;
      if (validFileTypes.includes(fileType)) {
        const storageRef = ref(storage, `files/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const fileURL = await getDownloadURL(storageRef);
        payload.fileURL = fileURL;
        payload.fileName = file.name;
      } else {
        console.log('Invalid file type');
        return;
      }
    }

    await addDoc(messageRef, payload);

    setFormValue('');
    setFile(null);
    setTags([]); // Clear selected tags after sending a message
  };

  // Scroll to the bottom of the messages when new messages are loaded
  useEffect(() => {
    if (scrollTo.current) {
      scrollTo.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Google Sign-In Function
  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  // Log out user
  const logOut = () => {
    signOut(auth);
  };

  return (
    <div className="App">
      {/* Render chat if user is logged in, otherwise show WelcomePage */}
      {user ? (
        <div className="chat-container">
          {/* Messages */}
          <div className="messages">
            <div ref={scrollTo}></div>
            {messages &&
              messages.docs.map((msg) => (
                <ChatMessage key={msg.id} message={msg.data()} user={user} />
              ))}
          </div>

          {/* Message input form */}
          <form>
            <label className={`file-input-label ${file ? 'dark' : ''}`}>
              Choose File
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </label>
            <input
              type="text"
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
            />
            <button onClick={(e) => sendMessage(e)}>Send</button>
          </form>
          {file && <div className="file-input-display">{file.name}</div>}

          {/* Tags input */}
          <div className="tags-section">
            <div className="tags-container">
              {tags.map((tag, index) => (
                <div className="tag" key={index}>
                  {tag}
                  <button onClick={() => removeTag(index)}>x</button>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type interests and press Enter"
              onKeyDown={(e) => handleTagInput(e)}
            />
          </div>

          {/* Log out button */}
          <div className="buttons">
            <button className="logout" onClick={() => logOut()}>
              Welcome! Log out here.
            </button>
          </div>
        </div>
      ) : (
        <WelcomePage signInWithGoogle={googleSignIn} />
      )}
    </div>
  );
}

// Component for rendering chat messages
function ChatMessage(props) {
  const { message, user } = props;
  const { text, uid, photoURL, fileURL, fileName } = message;

  const isSentByCurrentUser = uid === user.uid;

  return (
    <div
      className={`message-container ${
        isSentByCurrentUser ? 'sent' : 'received'
      }`}
    >
      {/* Display user's profile picture for received messages */}
      {!isSentByCurrentUser && (
        <img src={photoURL} alt="User" className="profile-picture" />
      )}
      {/* Display file download link or text message */}
      {fileURL ? (
        <div className="download-container">
          <a
            href={fileURL}
            target="_blank"
            rel="noopener noreferrer"
            className="download-link"
          >
            Download {fileName}
          </a>
        </div>
      ) : (
        <p>{text}</p>
      )}
      {/* Display user's profile picture for sent messages */}
      {isSentByCurrentUser && (
        <img src={photoURL} alt="User" className="profile-picture" />
      )}
    </div>
  );
}

export default App;