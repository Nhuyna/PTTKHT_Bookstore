import session from "express-session";
import FileStoreFactory from "session-file-store";
import path from "path";

// MemoryStore cho dev (lưu session trong bộ nhớ)
import Memorystore from "memorystore"; // Đảm bảo rằng bạn sử dụng đúng tên import

const FileStore = FileStoreFactory(session);

const configSession = (app) => {
  const isProd = process.env.NODE_ENV === "production";

  const sessionOptions = {
    secret: "yennhicute", // 👉 Nên đưa vào .env khi deploy
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // 👉 Nên set true nếu dùng HTTPS
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3600000, // 1 giờ
    },
  };

  if (isProd) {
    // Sử dụng FileStore cho môi trường production
    const storagePath = path.join(process.cwd(), "sessions");
    sessionOptions.store = new FileStore({
      path: storagePath,
      useAsyncWrite: true,
      reapInterval: 3600, // Dọn dẹp session cũ mỗi giờ
      logFn: () => {},
    });
  } else {
    // Sử dụng MemoryStore cho môi trường development
    console.log("✅ Using MemoryStore (Dev mode)");
    const MemoryStore = Memorystore(session); // Khởi tạo MemoryStore bằng cách này
    sessionOptions.store = new MemoryStore({
      checkPeriod: 86400000, // Dọn dẹp session cũ mỗi 24h
    });
  }

  // Cấu hình session với các options đã chọn
  app.use(session(sessionOptions));
};

export default configSession;
