import './App.css';
import { useState, useRef } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEisdUHstJfteCcfXoWqa47hJBqKkwIqg",
  authDomain: "js-chat-8bf89.firebaseapp.com",
  projectId: "js-chat-8bf89",
  storageBucket: "js-chat-8bf89.appspot.com",
  messagingSenderId: "997768571301",
  appId: "1:997768571301:web:553f19b6bbe4baacea604c"
};

// Initialize Firebase
if (!firebase.apps.length) {
   firebase.initializeApp(firebaseConfig);
} else {
   firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App d-flex align-items-center flex-column">
      <header className="App-header d-flex justify-content-around p-3 bg-primary w-100">
        <div className="logo">
          js-chat
          <a href="https://github.com/TonyHg/js-chat" target="_blank" rel="noreferrer" className="ml-3" >
            <svg className="links" xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" width="24" height="24" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
        <Logout />
      </header>
      { user ? <Chat /> : <Login /> }
    </div>
  );
}

const Logout = () => {
  return auth.currentUser && (<div className="btn btn-danger" onClick={() => auth.signOut()}>Log out</div>)
}

const Login = () => {
  const onLoginWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div className="btn btn-primary m-auto" onClick={onLoginWithGoogle}>Login with Google</div>
  );
};

const Chat = () => {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(30);

  // Real time 
  const [messages] = useCollectionData(query, {idField: 'id'});

  const [currentMessage, setCurrentMessage] = useState('');

  const messageRef = useRef()

  const postMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: currentMessage,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setCurrentMessage('');
    messageRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className='chat container d-flex flex-column justify-content-end'>
      <div className='chat-box py-3'>
        { messages && messages.map(message => <Message key={message.id} message={message} />) }
        <div ref={ messageRef }></div>
      </div>
      <form onSubmit={postMessage}>
        <div className="input-group my-3">
          <input value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} type="text" className="form-control" placeholder="Type something" aria-label="Message"/>
          <div className="input-group-append">
            <button className="btn btn-outline-secondary send-btn" type="submit">Send</button>
          </div>
        </div>
      </form>
    </div>
  );
};

const Message = ({ message }) => {
  const isUserClass = message.uid === auth.currentUser.uid ? 'user' : 'others';
  return (
    <div className={`d-flex message ${isUserClass} p-2`}>
      <img className='user-picture mx-2' src={ message.photoURL }/>
      <div className='message-text py-2 px-3'>{ message.text }</div>
    </div>
  );
}

export default App;
