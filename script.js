// 🔌 Подключение Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// 🔥 Вставь свой Firebase config здесь
const firebaseConfig {
  apiKey: "AIzaSyCGD6JMrCfnBRNWVXXYKY2QCx3VpW-efKk",
  authDomain: "now-russia-forum.firebaseapp.com",
  projectId: "now-russia-forum",
  storageBucket: "now-russia-forum.firebasestorage.app",
  messagingSenderId: "956603471160",
  appId: "1:956603471160:web:fbff976857b10591609dcd"
};

// Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// DOM элементы
const authDiv = document.getElementById("auth");
const forumDiv = document.getElementById("forum");
const topicsDiv = document.getElementById("topics");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const titleInput = document.getElementById("title");
const textInput = document.getElementById("text");

let currentUser = null;
let isAdmin = false;

// 🔐 Вход / регистрация
window.login = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) return alert("Введите email и пароль");

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      return alert("Ошибка регистрации: " + err.message);
    }
  }
};

// 🔄 Проверка состояния входа
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    // Проверка, админ ли
    const adminDoc = await getDoc(doc(db, "admins", user.email));
    isAdmin = adminDoc.exists();

    authDiv.classList.add("hidden");
    forumDiv.classList.remove("hidden");
    loadTopics();
  }
});

// ✏️ Создание темы
window.createTopic = async () => {
  const title = titleInput.value.trim();
  const text = textInput.value.trim();

  if (!title || !text) return alert("Введите заголовок и текст");

  await addDoc(collection(db, "topics"), {
    title,
    text,
    user: currentUser.email,
    created: Date.now(),
    admin: isAdmin
  });

  titleInput.value = "";
  textInput.value = "";

  loadTopics();
};

// 📥 Загрузка тем
async function loadTopics() {
  topicsDiv.innerHTML = "";
  const snap = await getDocs(collection(db, "topics"));

  snap.forEach(docu => {
    const d = docu.data();
    const div = document.createElement("div");
    div.className = "topic";
    div.innerHTML = `
      <b>${d.title}</b> ${d.admin ? '<span class="admin">[ADMIN]</span>' : ''}<br>
      ${d.text}<br>
      <i>${d.user}</i>
      ${isAdmin ? `<button onclick="deleteTopic('${docu.id}')">Удалить</button>` : ''}
    `;
    topicsDiv.appendChild(div);
  });
}

const adminDoc = await getDoc(doc(db, "admins", user.email));
isAdmin = adminDoc.exists(); // true, если email есть в коллекции admins

// ❌ Удаление темы (только для админа)
window.deleteTopic = async (id) => {
  if (!isAdmin) return alert("Только админ может удалять темы");

  await deleteDoc(doc(db, "topics", id));
  loadTopics();
};