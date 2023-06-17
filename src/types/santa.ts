export interface Employee {
    Employee_EmailID: string;
    Employee_Name: string;
}

export interface Result {
    Employee_EmailID: string;
    Employee_Name: string;
    Secret_Child_Name: string;
    Secret_Child_EmailID: string;
}

export interface Input{
    name: string;
    file: any[]
}