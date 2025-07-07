const ss = SpreadsheetApp.getActiveSpreadsheet();  //スプレッドシートアプリを呼び出して、現在のスプレッドシートファイルを取得
const staffRegister = ss.getSheetByName("スタッフ名簿"); //スタッフ名簿シートを取得
const dayOffSheet = ss.getSheetByName("希望休入力カレンダー"); //現場が入力するシートを取得
const testSheet = ss.getSheetByName("テスト"); //ただのテスト。ちゃんとsetValuesできるか見るため。
// testSheet.getRange(1,1,staffsData.length,staffsData[0].length).setValues(staffsData);テストで使えるよ
let staffsData = staffRegister.getRange(2, 1, staffRegister.getLastRow() - 1, staffRegister.getLastColumn()).getValues(); //スタッフ名簿のレコードを取得
const staffColRow = staffRegister.getRange(1, 1, 1, staffRegister.getLastColumn()).getValues();//スタッフ名簿のスタッフを取得
const staffCol = staffColRow[0];//上段のを一次元配列にする
const date = new Date();

//1日分のシフトを作成する関数DailyShiftAutomation()を月末までループさせる関数
function ShiftAutomation() {
  const shiftYear = dayOffSheet.getRange(1, 1).getValue(); //希望休カレンダーにある　年　を取得
  const shiftMonth = dayOffSheet.getRange(1, 6).getValue();//希望休カレンダーにある　月　を取得
  const eoMonth = new Date(shiftYear, shiftMonth, 0).getDate();     //希望休カレンダーにある　月末日　を取得
  // const shiftDate = dayOffSheet.getRange(3, 3, 1, eoMonth).getValues(); 
  const shiftDate = (day) => new Date(shiftYear, shiftMonth - 1, day);    //アロー関数だとこう
  // function shiftDate (day) {
  //   const theShiftDate = new Date(shiftYear, shiftMonth-1, day);
  //   return theShiftDate;
  // };
  let monthlyShiftData = []; //当月シフトデータ
  for (i = 1; i <= eoMonth; i++) {
    const daily = [shiftDate(i), "日勤", ...DailyShiftAutomation(i).map(row => row[1])];//1日分のシフトデータを[日付、勤務帯、出勤者名]にする
    monthlyShiftData.push(daily); //日毎にpushして二次元配列化
  };
  Logger.log(monthlyShiftData)
  testSheet.getRange(2, 1, monthlyShiftData.length, monthlyShiftData[0].length).setValues(monthlyShiftData); //テストシートに転記
};


// ⭐️条件⭐️：希望休の操作
//希望休に合致しないスタッフを引数d日のみ二次元配列にする 
function RequestDayOff(d, staffsDataArray) {  //d:日にち;数値型 staffsDataArray:スタッフデータの配列;二次元配列型
  //希望休カレンダーにあるスタッフ名簿を取得する
  const dayOffStaffs = dayOffSheet.getRange(6, 1, dayOffSheet.getLastRow() - 5, 1).getValues().flat();
  //希望休カレンダー(スプレッドシート)のd日分のデータを取得する　！スタッフ名も取り出して二次元配列に！
  const reqDayOff = dayOffSheet.getRange(6, d + 2, dayOffStaffs.length, 1).getValues().flat();
  //スタッフと希望休の有無を二次元配列化した。
  const dailyReqDayArray = dayOffStaffs.map((item, i) => [item, reqDayOff[i]]);
  //staffDatasの中でdailyReqDayArrayの希望休がある人を除く。
  const notReqDayOff = dailyReqDayArray
    .filter(([name, dayoff]) => dayoff == "")  //希望休がない人を
    .map(([name]) => name); // 一次元配列に
  const filteredStaffsData = staffsDataArray.filter(([_, name]) => notReqDayOff.includes(name));//staffsDataの中で合致するレコードを取り出す。
  return filteredStaffsData;
};

//1日分のシフトを作成する関数
function DailyShiftAutomation() {  //引数dは「希望休入力カレンダー」シートの日付部分
  const d = 8  //後からもどす
  let dailyStaffs = [];//その日のスタッフ配列
  //テストシート※最後に消す！

  //⭐️条件⭐️日勤できないスタッフを除外する
  const staffEmploymentTypeColol = staffCol.indexOf("雇用形態");//雇用形態列の列数を取得
  const employTypeOfDay = ["フルタイム", "日勤専従"];
  staffsData = staffsData.filter(row => employTypeOfDay.includes(row[9]));
  
  //前日夜勤の場合は日勤には当てない　‼️作業中‼️


  //希望休の関数を使う
  staffsData = RequestDayOff(d, staffsData); 

  //⭐️条件⭐️　特定の職種の最低人数を抽出して　変数dailyStaffs格納する
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
};
