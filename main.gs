const ss = SpreadsheetApp.getActiveSpreadsheet();  //スプレッドシートアプリを呼び出す
const staffRegister = ss.getSheetByName("スタッフ名簿"); //スタッフ名簿シートを取得
const chooseReqDayOffSheet = ss.getSheetByName("希望休入力カレンダー"); //現場が入力するシートを取得
const testSheet = ss.getSheetByName("テスト");
//スタッフ名簿を二次元配列で取得
const date = new Date();

//1日分のシフトを作成する関数DailyShiftAutomation()を月末までループさせる関数
function ShiftAutomation() {
  const shiftYear = chooseReqDayOffSheet.getRange(1, 1).getValue(); //希望休カレンダーにある　年　を取得
  const shiftMonth = chooseReqDayOffSheet.getRange(1, 6).getValue();//希望休カレンダーにある　月　を取得
  const eoMonth = new Date(shiftYear, shiftMonth, 0).getDate();     //希望休カレンダーにある　月末日　を取得
  // const shiftDate = chooseReqDayOffSheet.getRange(3, 3, 1, eoMonth).getValues(); 
  const shiftDate = (day) => new Date(shiftYear,shiftMonth-1,day);    //アロー関数だとこう
  // function shiftDate (day) {
  //   const theShiftDate = new Date(shiftYear, shiftMonth-1, day);
  //   return theShiftDate;
  // };
  Logger.log(shiftDate(1));
  for (i = 0; i < eoMonth - 1; i++) {
    let dailyShiftData = [shiftDate(i), "日勤", ...DailyShiftAutomation(i).map(row => row[1])];
    Logger.log(dailyShiftData)
  };
  testSheet.getRange(2, 1, 1, dailyShiftData.length).setValues([dailyShiftData]);
};

//1日分のシフトを作成する関数
function DailyShiftAutomation(d) {  //引数dは「希望休入力カレンダー」シートの日付部分
  const staffsData = staffRegister.getRange(2, 1, staffRegister.getLastRow() - 1, staffRegister.getLastColumn()).getValues();
  const staffColRow = staffRegister.getRange(1, 1, 1, staffRegister.getLastColumn()).getValues();//スタッフ名簿のスタッフを取得
  const staffCol = staffColRow[0];//上段のを一次元配列にする
  let dailyStaffs = [];//その日のスタッフ配列
  //テストシート※最後に消す！
  const staffEmploymentTypeColol = staffCol.indexOf("雇用形態");//雇用形態列の列数を取得

  //⭐️条件⭐️日勤できないスタッフを除外する
  const employTypeOfDay = ["フルタイム", "日勤専従"];
  for (let i = staffsData[0].length; i >= 0; i--) { //配列の後ろからループさせる
    // if(staffsData[i][staffEmploymentTypeColol] === "フルタイム" || staffsData[i][staffEmploymentTypeColol] === "日勤専従"){   こっちでも行ける
    if (!employTypeOfDay.includes(staffsData[i][staffEmploymentTypeColol])) { //勤務形態の条件に合致しないものを
      staffsData[i] = [""]; //空欄にする
    };
  };

  // ⭐️条件⭐️：希望休の操作
  //希望休が入力されている範囲のデータを取得する
  const chooseReqDayOff = chooseReqDayOffSheet.getRange(6, d + 2, staffsData.length, 1).getValues();

  // 希望休入力シートの入力欄に"希""有"があれば、配列を空欄にする
  for (let i = 0; i < staffsData.length; i++) {
    if (chooseReqDayOff[i] == "希" || chooseReqDayOff[i] == "有") {
      staffsData[i] = [""]
    };
  };

  //⭐️条件⭐️　特定の職種の最低人数を抽出して　変数dailyShiftarray格納する
  const requiredNurses = 2;//看護師必要人数　　一旦直打ちで(2025/07/04)
  const requiredDailyStaffs = 5;  //その日の最低出勤人数
  const requiredCareWarkers = requiredDailyStaffs - requiredNurses; //介護士必要人数
  const jobCol = 8; //スタッフ名簿における職業カラム
  //看護師に合致するスタッフデータstaffDatasを当日シフトdailyShiftArrayにfilterする
  const nurseStaffs = staffsData.filter(n => n[jobCol] == "看護師");

  // 看護師を2人ランダムで抽出する
  const randomizeNurses = nurseStaffs.sort(() => Math.random() - 0.5).slice(0, requiredNurses); //"sort(()=>Math.random()-0.5)"で配列をランダム化
  //　選ばれなかった看護師を抽出する
  const leftOverNurses = nurseStaffs.filter(l => !randomizeNurses.includes(l));
  //　介護士を選ぶ
  const careWorkerStaffs = staffsData.filter(o => o[jobCol] == "介護士");
  //　選ばれなかった看護師と他の職種を同じ配列へ
  const leftOverStaffs = [...leftOverNurses, ...careWorkerStaffs];
  //　介護士をランダムで抽出する
  const randommizeCareWorkers = leftOverStaffs.sort(() => Math.random() - 0.5).slice(0, requiredCareWarkers);
  //　当日シフト配列に格納
  dailyStaffs = [...randomizeNurses, ...randommizeCareWorkers];
  return dailyStaffs;

  //フラグ持ちさせて排除すべきもの（希望休・前日まで出勤情報（週休1日以上、月休9日、日夜条件））を同じ処理で回す。　　
  //→  その後、看護師を最低人数格納する　→  介護士のところに残りの看護師とその他職業を格納する
  //夜勤を作成　　→   月末まで回す。
};
