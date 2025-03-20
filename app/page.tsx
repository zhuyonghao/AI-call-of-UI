import Chat from "@/components/prebuilt/chat";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center">
      <h1 className="main-title">AI健身助手</h1>
      <p className="subtitle">您的个性化健身教练，随时随地为您提供专业指导</p>
      
      <div className="chat-container">
        <Chat />
      </div>
      
      <button className="login-btn">
        <i className="fas fa-user me-2"></i>登录/注册
      </button>
    </main>
  );
}
