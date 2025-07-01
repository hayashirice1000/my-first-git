function ShiftAutomation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const staffsheet = ss.getSheetByName("スタッフ名簿"); //staffレジスター
  const staff = staffsheet.getRange(2, 1, staffsheet.getLastRow() - 1, staffsheet.getLastColumn()).getValues(); //staffs複数なら複数形にする
  const staffcolrow = staffsheet.getRange(1, 1, 1, staffsheet.getLastColumn()).getValues()
  const staffcol = staffcolrow[0];
  const date = new Date();
  let shiftarray = [];//その日のスタッフ配列

  const employmentTypecol = staffcol.indexOf("雇用形態");

  // 日勤スタッフに合致するスタッフ
  let daystaff = [];//日勤スタッフ
  const employTypeOfday = ["フルタイム", "日勤専従"];
  for (let i = 0; i < staff.length; i++) {
    // if(staff[i][employmentTypecol] === "フルタイム" || staff[i][employmentTypecol] === "日勤専従"){   こっちでも行ける
    if (employTypeOfday.includes(staff[i][employmentTypecol])) {
      daystaff.push(staff[i]);
    };
  };
  // Logger.log(daystaff);

  // 希望休の操作
  const reqdayoffsheet = ss.getSheetByName("希望休");
  const choosereqdayoffsheet = ss.getSheetByName("希望休入力カレンダー(案)");
  const prereqstaff = choosereqdayoffsheet.getRange(6, 1, choosereqdayoffsheet.getLastRow() - 5, 1).getValues().map(row => row[0]);
  const dateofchoosereqdayoff = choosereqdayoffsheet.getRange(3, 3, 1, 31).getValues().filter(item => item)[0];
  const choosereqdayoff = choosereqdayoffsheet.getRange(6, 3, prereqstaff.length, dateofchoosereqdayoff.length).getValues();

  // if文で”希"があったら、その日付を抽出する　　　というコードを書く
  // その後にfor文で回して日付を配列に格納する
  if (choosereqdayoff[0][0] == "希") {
    
  };






};
