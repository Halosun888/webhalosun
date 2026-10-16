/** HALOSUN - Nhận báo giá từ trang web và ghi vào Google Sheet.
 *  Cách dùng:
 *  1) Tạo Google Sheet mới -> Tiện ích mở rộng -> Apps Script -> dán toàn bộ file này vào Code.gs.
 *  2) Triển khai -> Tùy chọn triển khai mới -> Ứng dụng web:
 *       Thực thi bằng: Tôi | Ai có quyền truy cập: Bất kỳ ai -> Triển khai (cấp quyền khi được hỏi).
 *  3) Copy link kết thúc bằng /exec, dán vào nút "⚙ Cài đặt lưu báo giá" trên trang web.
 *  Mỗi mã báo giá chỉ có một dòng: lưu lại lần nữa sẽ CẬP NHẬT dòng cũ, không tạo dòng trùng. */
const TOKEN = '';   // (tuỳ chọn) đặt một chuỗi bí mật; nếu đặt thì phải nhập đúng ở cửa sổ cài đặt trên trang web
const SHEET_Q = 'BaoGia', SHEET_I = 'ChiTiet';
const HEAD_Q = ['Thời gian','Mã báo giá','Tên khách hàng','SĐT khách','Địa danh công trình','Nhân viên KD','SĐT nhân viên','Loại hình điện','Cấp điện áp','Nhu cầu (kWh/tháng)','Tiền điện EVN (đ/tháng)','Kịch bản','PPA','Vĩ độ','Kinh độ','PVout (kWh/kWp/năm)','Công suất (kWp)','Tấm pin','Số tấm','Inverter','Số INV','Pin lưu trữ','Số bộ pin','Tổng đầu tư (đ)','Chiết khấu (%)','Tổng thanh toán (đ)','Tiết kiệm (đ/tháng)','Hoàn vốn (năm)','Sản lượng (kWh/tháng)','Nhân công'];
const HEAD_I = ['Mã báo giá','STT','Hạng mục','Hãng / Mã','Số lượng','Đơn giá (đ)','Thành tiền (đ)'];

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function sheet_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#1e3a8a').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}
function doGet() { return out_({ ok: true, msg: 'HALOSUN báo giá: sẵn sàng nhận dữ liệu' }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    if (TOKEN && d.token !== TOKEN) return out_({ ok: false, error: 'Sai mã bảo vệ' });
    if (d.action !== 'saveQuote' || !d.quote) return out_({ ok: false, error: 'Dữ liệu không hợp lệ' });
    const q = d.quote, sq = sheet_(SHEET_Q, HEAD_Q), si = sheet_(SHEET_I, HEAD_I);
    const row = [q.time, q.code, q.name, q.phone, q.place, q.sale, q.salePhone, q.usage, q.volt, q.kwh, q.bill, q.scenario, q.ppa,
      q.lat, q.lng, q.pvout, q.kwp, q.pv, q.pvq, q.inv, q.invq, q.bat, q.batq, q.sum, q.disc, q.net, q.save, q.payback, q.prod, q.labor];
    // cập nhật nếu đã có mã báo giá này, nếu không thì thêm dòng mới
    const n = sq.getLastRow();
    const codes = n > 1 ? sq.getRange(2, 2, n - 1, 1).getValues().map(function (r) { return String(r[0]); }) : [];
    const idx = codes.indexOf(String(q.code));
    const target = idx >= 0 ? idx + 2 : n + 1;
    sq.getRange(target, 4, 1, 1).setNumberFormat('@');   // giữ số 0 đầu của số điện thoại
    sq.getRange(target, 7, 1, 1).setNumberFormat('@');
    sq.getRange(target, 1, 1, row.length).setValues([row]);
    // chi tiết vật tư: xoá dòng cũ của mã này rồi ghi lại
    for (let r = si.getLastRow(); r >= 2; r--) { if (String(si.getRange(r, 1, 1, 1).getValues()[0][0]) === String(q.code)) si.deleteRow(r); }
    const items = (q.items || []).map(function (i) { return [q.code, i.stt, i.name, i.brand, i.qty, i.unit, i.amount]; });
    if (items.length) si.getRange(si.getLastRow() + 1, 1, items.length, HEAD_I.length).setValues(items);
    return out_({ ok: true, code: q.code, updated: idx >= 0 });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}
