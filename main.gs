function ShiftAutomation() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();  //スプレッドシートアプリを呼び出す
  const staffRegister = ss.getSheetByName("スタッフ名簿"); //スタッフ名簿シートを取得
  //スタッフ名簿を二次元配列で取得
  const staffsData = staffRegister.getRange(2, 1, staffRegister.getLastRow() - 1, staffRegister.getLastColumn()).getValues();
  const staffColRow = staffRegister.getRange(1, 1, 1, staffRegister.getLastColumn()).getValues();//スタッフ名簿のスタッフを取得
  const staffCol = staffColRow[0];//上段のを一次元配列にする
  const date = new Date();
  let shiftArray = [];//その日のスタッフ配列

  const staffEmploymentTypeColol = staffCol.indexOf("雇用形態");//雇用形態列の列数を取得

  /*
    ①まずは対象スタッフの配列を作成
    ②フラグ持ちをしていって、条件条件に合わないものをremoveしていく様にしてみる
    ③最後にランダム化してsetValuesする　
  */
  
  //⭐️条件⭐️日勤できないスタッフを除外する
  const employTypeOfDay = ["フルタイム", "日勤専従"];
  for (let i = staffsData[0].length; i >= 0; i--) { //配列の後ろからループさせる
    // if(staffsData[i][staffEmploymentTypeColol] === "フルタイム" || staffsData[i][staffEmploymentTypeColol] === "日勤専従"){   こっちでも行ける
    if (!employTypeOfDay.includes(staffsData[i][staffEmploymentTypeColol])) { //勤務形態の条件に合致しないものを
      staffsData[i] = [""]; //空欄にする
    };
  };
  //ここで日勤対象のスタッフに絞れた
  Logger.log(staffsData);


  // ⭐️条件⭐️：希望休の操作
  const reqDayOffSheet = ss.getSheetByName("希望休"); //シート取得
  const chooseReqDayOffSheet = ss.getSheetByName("希望休入力カレンダー(案)"); //現場が入力するシートを取得
  //対象月の1日〜月末日までの日にちを取得して　空欄を除外する
  const dateOfChooseReqDayOff = chooseReqDayOffSheet.getRange(3, 3, 1, 31).getValues().filter(item => item)[0];
  //希望休が入力されている範囲のデータを取得する
  const chooseReqDayOff = chooseReqDayOffSheet.getRange(6, 3, staffsData[0].length, dateOfChooseReqDayOff.length).getValues();
  
  // 希望休入力シートの入力欄に"希""有"があれば、配列を空欄にする
  for(let i = 0; i < staffsData.length; i++){
    for( let j = 0 ; j < staffsData[0].length ; j++){

      if (chooseReqDayOff[i][j] == "希" || chooseReqDayOff[i][j] =="有") {


      };
    }
  };
  //　　※2025/07/02 1日ごとにシフトを作りたいけど、二次元配列ループだと、1ヶ月丸ごと作ることになる。。




};
