document.addEventListener("DOMContentLoaded", async () => {
  const provinceSelect = document.getElementById("provinceSelect");
  const districtSelect = document.getElementById("districtSelect");
  let data = [];

  try {
    const res = await fetch("/data/data.json");
    data = await res.json();

    console.log("Dữ liệu tỉnh/thành:", data); 
    data.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.name;
      opt.textContent = item.name;
      provinceSelect.appendChild(opt);
    });

    // Khi chọn tỉnh → load quận tương ứng
    provinceSelect.addEventListener("change", () => {
      const selected = provinceSelect.value;
      districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
      const found = data.find((p) => p.name === selected);
      if (found) {
        found.districts.forEach((d) => {
          const opt = document.createElement("option");
          opt.value = d;
          opt.textContent = d;
          districtSelect.appendChild(opt);
        });
      }
    });
  } catch (err) {
    console.error("Lỗi khi tải dữ liệu tỉnh thành:", err);
  }
});
