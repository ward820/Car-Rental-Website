/* ملف الجافا سكريبت الوحيد - جميع التوابع اللازمة */

/* التحقق من الاسم: أحرف عربية ومسافات فقط */
function validateName(name) {
  if (name === "") {
    return "الاسم مطلوب";
  }
  var re = /^[\u0621-\u064A]+( [\u0621-\u064A]+)*$/;
  if (!re.test(name)) {
    return "أحرف هجائية عربية فقط";
  }
  return "";
}

/* التحقق من الرقم الوطني: 11 خانة، أول خانتين من 01 إلى 14 */
function validateNationalId(nid) {
  if (nid === "") {
    return "الرقم الوطني مطلوب";
  }
  if (!/^[0-9]{11}$/.test(nid)) {
    return "يجب أن يتكون من 11 رقماً";
  }
  var province = parseInt(nid.substring(0, 2), 10);
  if (province < 1 || province > 14) {
    return "أول خانتين يجب أن تكونا بين 01 و 14";
  }
  return "";
}

/* تحويل نص yyyy-mm-dd إلى تاريخ، وإرجاع null إذا كان غير صحيح */
function parseDate(text) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(text)) {
    return null;
  }
  var y = parseInt(text.substring(0, 4), 10);
  var m = parseInt(text.substring(5, 7), 10);
  var d = parseInt(text.substring(8, 10), 10);
  var dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return dt;
}

/* التحقق من رقم الموبايل: Syriatel (093, 098, 099) و MTN (094, 095, 096) */
function validateMobile(mobile) {
  if (mobile === "") {
    return "";
  }
  if (!/^09(3|4|5|6|8|9)[0-9]{7}$/.test(mobile)) {
    return "رقم غير مطابق لشبكتي Syriatel أو MTN";
  }
  return "";
}

/* التحقق من البريد الإلكتروني (اختياري) */
function validateEmail(email) {
  if (email === "") {
    return "";
  }
  if (!/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(email)) {
    return "بريد إلكتروني غير صحيح";
  }
  return "";
}

/* استخراج السعر الرقمي من نص مثل: 250000 ل.س */
function getPrice(text) {
  return parseInt(text.replace(/[^0-9]/g, ""), 10);
}

/* جمع السيارات المختارة */
function getSelectedCars() {
  var cars = [];
  $("input.selectCar:checked").each(function () {
    var row = $(this).closest("tr");
    var cells = row.children("td");
    cars.push({
      code: $(cells[0]).text(),
      model: $(cells[2]).text(),
      price: getPrice($(row).find("td.price").text())
    });
  });
  return cars;
}

/* حساب وعرض النتيجة */
function showResult(cars, days) {
  var html = "<p>الاسم: " + $("#fullName").val() + "</p>";
  html += "<table class=\"data\"><tr><th>السيارة</th><th>السعر اليومي</th><th>عدد الأيام</th><th>المجموع</th></tr>";
  var total = 0;
  for (var i = 0; i < cars.length; i++) {
    var sub = cars[i].price * days;
    total += sub;
    html += "<tr><td>" + cars[i].model + "</td><td>" + cars[i].price + " ل.س</td><td>" + days + "</td><td>" + sub + " ل.س</td></tr>";
  }
  html += "</table>";
  var discount = 0;
  if (days > 10) {
    discount = total * 0.05;
  }
  var finalAmount = total - discount;
  html += "<p>عدد أيام التأجير لكل سيارة: " + days + " يوم</p>";
  html += "<p>المجموع قبل الخصم: " + total + " ل.س</p>";
  html += "<p>الخصم (5% لمدة أكثر من 10 أيام): " + discount + " ل.س</p>";
  html += "<p class=\"total\">المبلغ النهائي: " + finalAmount + " ل.س</p>";
  $("#resultContent").html(html);
  $("#overlay").fadeIn(300);
}

/* معالجة الإرسال والتحقق من جميع الحقول */
function handleSubmit() {
  $(".error").text("");
  var ok = true;
  var msg;

  msg = validateName($.trim($("#fullName").val()));
  if (msg !== "") { $("#errName").text(msg); ok = false; }

  msg = validateNationalId($("#nationalId").val());
  if (msg !== "") { $("#errNid").text(msg); ok = false; }

  var start = parseDate($("#startDate").val());
  var end = parseDate($("#endDate").val());
  var startOk = true;
  var endOk = true;
  if ($("#startDate").val() === "") {
    $("#errStart").text("تاريخ البداية مطلوب"); ok = false; startOk = false;
  } else if (start === null) {
    $("#errStart").text("الصيغة المطلوبة yyyy-mm-dd وتاريخ صحيح"); ok = false; startOk = false;
  }
  if ($("#endDate").val() === "") {
    $("#errEnd").text("تاريخ النهاية مطلوب"); ok = false; endOk = false;
  } else if (end === null) {
    $("#errEnd").text("الصيغة المطلوبة yyyy-mm-dd وتاريخ صحيح"); ok = false; endOk = false;
  }
  var days = 0;
  if (startOk && endOk) {
    days = Math.round((end.getTime() - start.getTime()) / 86400000);
    if (days <= 0) {
      $("#errEnd").text("يجب أن يكون تاريخ النهاية لاحقاً لتاريخ البداية");
      ok = false;
    }
  }

  msg = validateMobile($("#mobile").val());
  if (msg !== "") { $("#errMobile").text(msg); ok = false; }

  msg = validateEmail($("#email").val());
  if (msg !== "") { $("#errEmail").text(msg); ok = false; }

  var cars = getSelectedCars();
  if (cars.length === 0) {
    $("#msgCars").text("الرجاء اختيار سيارة واحدة على الأقل");
    ok = false;
  }

  if (ok) {
    showResult(cars, days);
  }
}

/* ربط الأحداث باستخدام jQuery */
$(document).ready(function () {
  /* إظهار/إخفاء تفاصيل السيارة (يمكن إظهار عدة سيارات معاً) */
  $("input.showDetails").click(function () {
    var n = this.id.replace("det", "");
    $("#detailsrow" + n).toggle();
  });

  /* زر متابعة */
  $("#btnContinue").click(function () {
    if (getSelectedCars().length === 0) {
      $("#msgCars").text("الرجاء اختيار سيارة واحدة على الأقل");
      $("#bookingForm").hide();
    } else {
      $("#msgCars").text("");
      $("#bookingForm").slideDown(400);
    }
  });

  /* إرسال النموذج */
  $("#bookingForm").submit(function (e) {
    e.preventDefault();
    handleSubmit();
  });

  /* إغلاق نافذة النتيجة */
  $("#btnClose").click(function () {
    $("#overlay").fadeOut(200);
  });
});
