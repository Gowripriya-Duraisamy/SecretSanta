import XLSX from "xlsx";
import { Employee, Input, Result } from "../types/santa";
import path from "path";

export const fileConv = (file: Express.Multer.File) => {
  try {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet_name_list = workbook.SheetNames;

    //Identifying the input file either input file is list of employees or last year result file

    const name = sheet_name_list.includes("Employee-List")
      ? "Employee"
      : "Result";

    return {
      name,
      // converting the file into json object
      file: XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]),
    };
  } catch (error) {
    console.log(error);
  }
};

export const constructXLSXFile = (
  santaGiftList: Result[],
  fileName: string
) => {
  const workSheet = XLSX.utils.json_to_sheet(santaGiftList);
  const workBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workBook, workSheet, "Sheet 1");
  XLSX.writeFile(workBook, path.join(__dirname, "..", "controllers",  fileName), {
    type: "file",
  });
};

export const constructOutputExcel = (list: Input[]) => {
  const employeeList =
    list[0].name === "Employee"
      ? (list[0].file as Employee[])
      : (list[1].file as Employee[]);
  const previousYearList =
    list[0].name === "Employee"
      ? (list[1].file as Result[])
      : (list[0].file as Result[]);

  // If list is less than 2, We will not be able to meet the given constraints.
  if (employeeList.length <= 2) {
    throw new Error("Employee list is less than or equal to 2");
  }
  const emailList = employeeList.map((list) => list.Employee_EmailID);
  const employeeNameEmailMap = new Map();
  const previousSantaMap = new Map();

  //looping the previoust gift list inorder to exclude later
  previousYearList.forEach((data) => {
    previousSantaMap.set(data.Employee_EmailID, data.Secret_Child_EmailID);
  });

  // looping employee list to fetch name of employee later
  employeeList.forEach((data) => {
    employeeNameEmailMap.set(data.Employee_EmailID, data.Employee_Name);
  });

  // Looping employees and assigning the secret child for employee based upon the constraints
  return employeeList.map((employee) => {
    const excludeEmail = previousSantaMap.get(employee.Employee_EmailID);
    let removeIndex = 0;
    let secretChild;
    for (let i = emailList.length - 1; i >= 0; i--) {
      // Condition added to exclude self and previous year assigned employee
      if (
        emailList[i] !== excludeEmail &&
        emailList[i] !== employee.Employee_EmailID
      ) {
        removeIndex = i;
        secretChild = emailList[i];
        break;
      }
    }
    if (emailList.length > 1) {
      // swapping to the last index with childIndex
      [emailList[removeIndex], emailList[emailList.length - 1]] = [
        emailList[emailList.length - 1],
        emailList[removeIndex],
      ];
    }
    // removing the assigned secret child
    emailList.pop();
    return {
      Employee_Name: employee.Employee_Name,
      Employee_EmailID: employee.Employee_EmailID,
      Secret_Child_Name: employeeNameEmailMap.get(secretChild),
      Secret_Child_EmailID: secretChild,
    };
  });
};
