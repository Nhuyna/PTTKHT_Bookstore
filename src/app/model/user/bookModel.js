import db from "../../../config/db.js";
import categoryModel from "./categoryModel.js";

// Hàm tính toán phân trang
const paginate = (totalItems, currentPage, perPage) => {
  const totalPages = Math.ceil(totalItems / perPage);
  const offset = (currentPage - 1) * perPage;

  return {
    totalPages,
    offset,
    perPage,
  };
};

// Hàm lấy danh sách sách (có hoặc không có phân trang)
const getAllBooks = async (
  categoryId = null,
  offset = null,
  perPage = null,
  filters = {}
) => {
  try {
    // console.log(categoryId);
    // console.log("Lọc theo danh mục:", filters);

    let query = `
            SELECT 
                sp.SanPhamID, sp.TenSanPham, sp.ID_NXB, sp.MoTa, sp.Gia, sp.SoLuongTon, sp.SoTrang,
                GROUP_CONCAT(DISTINCT tg.TenTacGia SEPARATOR ', ') AS TacGia,
                GROUP_CONCAT(DISTINCT dm.TenDanhMuc SEPARATOR ', ') AS DanhMuc,
                a.Anh AS Anh
            FROM sanpham sp
            JOIN sp_dm ON sp.SanPhamID = sp_dm.SanPhamID
            JOIN danhmuc dm ON sp_dm.DanhMucID = dm.DanhMucID
            LEFT JOIN sp_tg ON sp.SanPhamID = sp_tg.SanPhamID
            LEFT JOIN tacgia tg ON sp_tg.IDTacGia = tg.IDTacGia
            LEFT JOIN anhsp a ON sp.SanPhamID = a.ID_SP AND a.STT = 1
            WHERE 1=1
        `;

    const params = [];

    // Lọc theo categoryId (nếu có)
    const allCategoryIDs = [];

    if (categoryId) {
      allCategoryIDs.push(categoryId);
    }
    if (filters.categoryIDs && filters.categoryIDs.length > 0) {
      allCategoryIDs.push(...filters.categoryIDs);
    }

    // Nếu có categoryId hoặc filters.categoryIDs, thực hiện lọc theo danh mục
    if (allCategoryIDs.length > 0) {
      const placeholders = allCategoryIDs.map(() => "?").join(",");
      query += ` AND dm.DanhMucID IN (${placeholders})`;
      params.push(...allCategoryIDs);
    }

    // Lọc theo giá
    if (filters.minPrice) {
      query += ` AND sp.Gia >= ?`;
      params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
      query += ` AND sp.Gia <= ?`;
      params.push(filters.maxPrice);
    }

    query += `
            GROUP BY sp.SanPhamID, sp.TenSanPham, sp.MoTa, sp.Gia, sp.SoLuongTon, sp.SoTrang, a.Anh
        `;

    // Lọc theo phân trang
    if (offset !== null && perPage !== null) {
      query += ` LIMIT ? OFFSET ?`;
      params.push(perPage, offset);
    }

    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

// Hàm lấy sản phẩm theo danh mục phổ biển
const getBooksinPopularCategory = async () => {
  const popularCategories = await categoryModel.getfiveCategoriespopular();
  let books = [];
  for (const i of popularCategories) {
    const tmp = {
      DanhMuc: i,
      SanPham: await getAllBooks(i.DanhMucID),
    };

    books.push(tmp);
  }
  return books;
};

const getProductDetail = async (id = null) => {
  if (id == null) return null;

  const query = `
  SELECT 
    sanpham.SanPhamID, 
    MoTa, 
    TenSanPham,
    GROUP_CONCAT(DISTINCT tacgia.TenTacGia SEPARATOR ', ') AS TacGia,
    GROUP_CONCAT(DISTINCT  sp_tg.IDTacGia SEPARATOR ', ') AS IDTacGiaList,
    TenNXB,
    SoLuongTon,
    SoTrang,
    GROUP_CONCAT(DISTINCT CONCAT(danhmuc.DanhMucID, ':', danhmuc.TenDanhMuc)) AS DanhMucInfo
  FROM sanpham
  JOIN sp_tg ON sanpham.SanPhamID = sp_tg.SanPhamID
  JOIN tacgia ON tacgia.IDTacGia = sp_tg.IDTacGia
  JOIN nxb ON sanpham.ID_NXB = nxb.ID_NXB
  JOIN sp_dm ON sanpham.SanPhamID = sp_dm.SanPhamID
  JOIN danhmuc ON sp_dm.DanhMucID = danhmuc.DanhMucID
  WHERE sanpham.SanPhamID = ?
  GROUP BY sanpham.SanPhamID, MoTa, TenSanPham, TenNXB, SoLuongTon, SoTrang
`;

  try {
    const [rows] = await db.execute(query, [id]);
    const product = rows[0];

    if (!product) return null;

    // Parse DanhMucInfo: "1:Kinh tế,2:Tâm lý"
    product.DanhMucs = product.DanhMucInfo
      ? product.DanhMucInfo.split(",").map((item) => {
          const [id, name] = item.split(":");
          return { id, name };
        })
      : [];

    delete product.DanhMucInfo;
    return product;
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", err);
    throw err;
  }
};

const getProductImages = async (productId) => {
  try {
    const query = `
            SELECT Anh FROM anhsp WHERE ID_SP = ?;
        `;
    const [rows] = await db.execute(query, [productId]);

    if (!rows.length) {
      return [];
    }

    const images = rows.map((row) => row.Anh);
    return images;
  } catch (error) {
    console.error("Error fetching images:", error);
    throw error;
  }
};

const getListProducts = async (danhMucIDs = []) => {
  if (!Array.isArray(danhMucIDs) || danhMucIDs.length === 0) {
    return [];
  }

  const placeholders = danhMucIDs.map(() => "?").join(",");

  const query = `
        SELECT 
            sanpham.SanPhamID, MoTa, TenSanPham, sp_tg.IDTacGia, TenTacGia, Gia, TenNXB,
            danhmuc.DanhMucID, danhmuc.TenDanhMuc,
            a.Anh AS Anh
        FROM sanpham
        JOIN sp_tg ON sanpham.SanPhamID = sp_tg.SanPhamID
        JOIN tacgia ON tacgia.IDTacGia = sp_tg.IDTacGia
        JOIN nxb ON sanpham.ID_NXB = nxb.ID_NXB
        JOIN sp_dm ON sanpham.SanPhamID = sp_dm.SanPhamID
        JOIN danhmuc ON sp_dm.DanhMucID = danhmuc.DanhMucID
        LEFT JOIN anhsp a ON sanpham.SanPhamID = a.ID_SP AND a.STT = 1
        WHERE sp_dm.DanhMucID IN (${placeholders})
        ORDER BY sanpham.SanPhamID
    `;

  try {
    const [rows] = await db.execute(query, danhMucIDs);
    const productMap = {};

    for (const row of rows) {
      if (!productMap[row.SanPhamID]) {
        productMap[row.SanPhamID] = {
          SanPhamID: row.SanPhamID,
          TenSanPham: row.TenSanPham,
          MoTa: row.MoTa,
          Gia: row.Gia,
          TenNXB: row.TenNXB,
          IDTacGia: row.IDTacGia,
          TenTacGia: row.TenTacGia,
          DanhMucs: [],
          Anh: row.Anh || null,
        };
      }

      const exists = productMap[row.SanPhamID].DanhMucs.find(
        (dm) => dm.DanhMucID === row.DanhMucID
      );
      if (!exists) {
        productMap[row.SanPhamID].DanhMucs.push({
          DanhMucID: row.DanhMucID,
          TenDanhMuc: row.TenDanhMuc,
        });
      }
    }

    return Object.values(productMap);
  } catch (err) {
    console.error("Lỗi khi truy vấn sản phẩm theo danh mục:", err);
    throw err;
  }
};

async function searchBooksByKeyword(keyword) {
  const [rows] = await db.execute(
    `
        SELECT DISTINCT sp.SanPhamID
        FROM sanpham sp
        LEFT JOIN sp_tg sptg ON sp.SanPhamID = sptg.SanPhamID
        LEFT JOIN tacgia tg ON sptg.IDTacGia = tg.IDTacGia
        WHERE sp.TenSanPham LIKE ? OR tg.TenTacGia LIKE ?
    `,
    [`%${keyword}%`, `%${keyword}%`]
  );

  return rows;
}

const getBooksByIds = async (idList) => {
  try {
    if (!Array.isArray(idList) || idList.length === 0) {
      return [];
    }

    const placeholders = idList.map(() => "?").join(", ");
    const query = `
            SELECT sp.SanPhamID, sp.TenSanPham, sp.ID_NXB, sp.MoTa, sp.Gia, sp.SoLuongTon, sp.SoTrang,
                   GROUP_CONCAT(DISTINCT tg.TenTacGia SEPARATOR ', ') AS TacGia,
                   GROUP_CONCAT(DISTINCT dm.TenDanhMuc SEPARATOR ', ') AS DanhMuc,
                   a.Anh AS Anh
            FROM sanpham sp
            JOIN sp_dm ON sp.SanPhamID = sp_dm.SanPhamID
            JOIN danhmuc dm ON sp_dm.DanhMucID = dm.DanhMucID
            LEFT JOIN sp_tg ON sp.SanPhamID = sp_tg.SanPhamID
            LEFT JOIN tacgia tg ON sp_tg.IDTacGia = tg.IDTacGia
            LEFT JOIN anhsp a ON sp.SanPhamID = a.ID_SP AND a.STT = 1
            WHERE sp.SanPhamID IN (${placeholders})
            GROUP BY sp.SanPhamID, sp.TenSanPham, sp.MoTa, sp.Gia, sp.SoLuongTon, sp.SoTrang, a.Anh
        `;

    const [rows] = await db.query(query, idList);
    return rows;
  } catch (error) {
    console.error("Error fetching books by IDs:", error);
    throw error;
  }
};

const filterBooks = async ({ maxPrice, categoryIDs }) => {
  let query = `
        SELECT 
            sp.SanPhamID, sp.TenSanPham, sp.MoTa, sp.Gia, sp.SoLuongTon, sp.SoTrang,
            GROUP_CONCAT(DISTINCT tg.TenTacGia SEPARATOR ', ') AS TacGia,
            GROUP_CONCAT(DISTINCT dm.TenDanhMuc SEPARATOR ', ') AS DanhMuc,
            a.Anh AS Anh
        FROM sanpham sp
        JOIN sp_dm ON sp.SanPhamID = sp_dm.SanPhamID
        JOIN danhmuc dm ON sp_dm.DanhMucID = dm.DanhMucID
        LEFT JOIN sp_tg ON sp.SanPhamID = sp_tg.SanPhamID
        LEFT JOIN tacgia tg ON sp_tg.IDTacGia = tg.IDTacGia
        LEFT JOIN anhsp a ON sp.SanPhamID = a.ID_SP AND a.STT = 1
        WHERE 1=1
    `;

  const params = [];

  if (maxPrice) {
    query += ` AND sp.Gia <= ?`;
    params.push(maxPrice);
  }

  if (categoryIDs && categoryIDs.length > 0) {
    const placeholders = categoryIDs.map(() => "?").join(",");
    query += ` AND dm.DanhMucID IN (${placeholders})`;
    params.push(...categoryIDs);
  }

  query += ` GROUP BY sp.SanPhamID`;

  const [rows] = await db.execute(query, params);
  return rows;
};
const getProductById = async (SanPhamID) => {
  const query = `
    SELECT 
      sanpham.SanPhamID, MoTa, TenSanPham, sp_tg.IDTacGia, TenTacGia, Gia, TenNXB,
      danhmuc.DanhMucID, danhmuc.TenDanhMuc,
      a.Anh AS Anh
    FROM sanpham
    JOIN sp_tg ON sanpham.SanPhamID = sp_tg.SanPhamID
    JOIN tacgia ON tacgia.IDTacGia = sp_tg.IDTacGia
    JOIN nxb ON sanpham.ID_NXB = nxb.ID_NXB
    JOIN sp_dm ON sanpham.SanPhamID = sp_dm.SanPhamID
    JOIN danhmuc ON sp_dm.DanhMucID = danhmuc.DanhMucID
    LEFT JOIN anhsp a ON sanpham.SanPhamID = a.ID_SP AND a.STT = 1
    WHERE sanpham.SanPhamID = ?
  `;

  try {
    const [rows] = await db.execute(query, [SanPhamID]);

    if (rows.length === 0) {
      return null;
    }

    const product = {
      SanPhamID: rows[0].SanPhamID,
      TenSanPham: rows[0].TenSanPham,
      MoTa: rows[0].MoTa,
      Gia: rows[0].Gia,
      TenNXB: rows[0].TenNXB,
      IDTacGia: rows[0].IDTacGia,
      TenTacGia: rows[0].TenTacGia,
      DanhMucs: [],
      Anh: rows[0].Anh || null,
    };

    // Thêm các danh mục vào product
    for (const row of rows) {
      const exists = product.DanhMucs.find(
        (dm) => dm.DanhMucID === row.DanhMucID
      );
      if (!exists) {
        product.DanhMucs.push({
          DanhMucID: row.DanhMucID,
          TenDanhMuc: row.TenDanhMuc,
        });
      }
    }

    return product;
  } catch (err) {
    console.error("Lỗi khi truy vấn sản phẩm theo ID:", err);
    throw err;
  }
};

export default {
  getAllBooks,
  getBooksinPopularCategory,
  paginate,
  getProductDetail,
  getListProducts,
  getProductImages,
  searchBooksByKeyword,
  getBooksByIds,
  filterBooks,
  getProductById,
};
