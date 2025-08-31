const dateStringToDate = (dateString) => {
    if (!dateString) return null;
    if(typeof dateString === 'number') {
        return new Date(dateString);
    }
    if (dateString instanceof Date) {
        return dateString;
    }
    if (dateString.indexOf("Date") >= 0) {
        dateString = dateString.substring(6, dateString.length - 2);
        return new Date(parseInt(dateString));
    } else {
        return new Date(dateString);
    }
}
let axios = ()=> window.axios;
export default {
    data: {
        sessionKey_Description: "Report_Description",
        sessionKey_CostCenterID: "Report_CostCenterID",
        sessionKey_ClaimCountryCode: "Report_ClaimCountryCode",
        sessionKey_ResidencyCountryCode: "Report_ResidencyCountryCode",
        sessionKey_Subledger: "Report_Subledger",
        sessionKey_ItemCostCenterID: "Item_CostCenterID",
        sessionKey_ShowSummary: "Report_ShowSummary",
        sessionKey_ItemTypeID: "Item_TypeID",
        sessionKey_ItemTypeName: "Item_TypeName",
        sessionKey_ReportID: "Report_ID",
        SessionKey_ItemID: "Item_ID",
        sessionKey_MealReson: "MealReson",
        sessionKey_CostCenter: "CostCenter",
        sessionKey_ExpenseType: "ExpenseType_",
        sessionKey_Company: "Company",
        sessionKey_Country: "Country",
        sessionKey_CityTypes: "CityType",
        sessionKey_CurrentUserManager: "CurrentUserManager",
        sessionKey_CurrentUser: "CurrentUser",
        sessionKey_MyExpenseList: "MyExpenseList",
        sessionKey_MyApproveList: "MyApproveList",
        sessionKey_ExpenseReport: "ExpenseReport_",
        sessionKey_ExpenseItems: "ExpenseItems_",
        sessionKey_ActivePage: "Edit_ActivePageIndex",
        sessionKey_CashAdvanced: "CashAdvanced",
        sessionKey_CashReturned: "CashReturned",
        sessionKey_CreditCardFund: "CreditCardFund",
        sessionKey_FirstLogin: "FirstLogin",
        sessionKey_ImageSize: "ImageSize",
        sessionKey_swiperOptionHeight:"SwiperOptionHeight",
    },
    mobileType() {
        var u = navigator.userAgent;
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        var result = isiOS ? 0 : (isAndroid ? 1 : -1);
        return result;
    },
    isFirstLogin() {
        var IsDisplayMyExpense = false;
        this.getIsDisplayMyExpense(result => {
            IsDisplayMyExpense = result.toLowerCase() == "true";
            if (IsDisplayMyExpense) {
                if (localStorage.getItem(this.data.sessionKey_FirstLogin) != null){
                    return false;
                }
                else {
                    localStorage.setItem(this.data.sessionKey_FirstLogin, true);
                    return true;
                }
            } else {
                return false;
            }
        });
    },
    isEditable(reportStatus) {
        if (typeof (reportStatus) == 'string')
            return reportStatus == "Not submitted" ||
                reportStatus ==
                "Rejected by Accounts Payable-Returned to Employee" ||
                reportStatus == "Rejected by Manager" ||
                reportStatus == "Rejected by Accounts Payable & Manager";
        return reportStatus && reportStatus.ReadOnly_Emp == 0;
    },
    canReview(reportStatus) {
        if (typeof (reportStatus) == 'string')
            return reportStatus == "Under Manager's Review" ||
                reportStatus == "Rejected by Accounts Payable-Returned to Manager"
                || reportStatus == "Rejected by Accounts Payable-Under Managers Review";
        return reportStatus && reportStatus.ReadOnly_Mgr == 0;
    },
    customAlert(msg, title, button1, button2, callback) {
        window.customAlert(msg, title, button1, button2, callback);
    },
    alert(msg, timeout, color, top, multiline) {
        window.ShowError(msg, timeout, color, top, multiline);
    },
    alertWarning(msg, timeout, color, top, multiline) {
        window.ShowWarning(msg, timeout, color, top, multiline);
    },
    confirm(msg) {
        var originalObject = this;
        return new Promise(function (resolve, reject) {
            originalObject.customAlert(msg, 'System Message', 'OK', 'Cancel', function (result) {
                resolve(result == 1);
            });
        });
    },
    formatAmount(s, n) {
        var pre = "";
        if (s < 0) {
            pre = "-";
            s = s * -1;
        }
        n = n > 0 && n <= 20 ? n : 2;
        s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
        var l = s
            .split(".")[0]
            .split("")
            .reverse(),
            r = s.split(".")[1];
        var t = "";
        for (var i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 == 0 && i + 1 != l.length ? "," : "");
        }
        return (
            pre +
            (t
                .split("")
                .reverse()
                .join("") +
                "." +
                r)
        );
    },
    formatDateAsLocal(datestring) {
        if (!datestring)
            return "";
        var date = dateStringToDate(datestring);
        return date.toLocaleDateString();
    },
    formatDateAsOriginal(datestring) {
        if (!datestring)
            return "";
        var date= dateStringToDate(datestring);
        var year = date.getFullYear() + '-';
        var month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var day = date.getDate();
        return year + month + day;
    },
    formatDateAsOriginalForUS(datestring) {
        if (!datestring)
            return "";
        var date= dateStringToDate(datestring);
        return date.toLocaleDateString();
    },
    clearStep1Session() {
        sessionStorage.removeItem(this.data.sessionKey_Description);
        sessionStorage.removeItem(this.data.sessionKey_CostCenterID);
        sessionStorage.removeItem(this.data.sessionKey_ClaimCountryCode);
        sessionStorage.removeItem(this.data.sessionKey_ResidencyCountryCode);
        sessionStorage.removeItem(this.data.sessionKey_Subledger);
    },
    clearReportSession() {
        sessionStorage.removeItem(this.data.sessionKey_ActivePage);
        sessionStorage.removeItem(this.data.sessionKey_Description);
        sessionStorage.removeItem(this.data.sessionKey_CostCenterID);
        sessionStorage.removeItem(this.data.sessionKey_ShowSummary);
        sessionStorage.removeItem(this.data.sessionKey_CashAdvanced);
        sessionStorage.removeItem(this.data.sessionKey_CashReturned);
        sessionStorage.removeItem(this.data.sessionKey_CreditCardFund);
    },
    clearItemSession() {
        sessionStorage.removeItem(this.data.SessionKey_ItemID);
        sessionStorage.removeItem(this.data.sessionKey_ItemCostCenterID);
        sessionStorage.removeItem(this.data.sessionKey_ItemTypeID);
        sessionStorage.removeItem(this.data.sessionKey_ItemTypeName);
    },
    getImageSize(callback) {
        var result = Object;
        if (sessionStorage.getItem(this.data.sessionKey_ImageSize) == null) {
            axios()
                .get("/Data/GetImageSize", {})
                .then(response => {
                    result = response.data;
                    sessionStorage.setItem(this.data.sessionKey_ImageSize, JSON.stringify(result));
                    callback(result);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            result = JSON.parse(sessionStorage.getItem(this.data.sessionKey_ImageSize));
            callback(result);
        }
    },
    getReasonForMeal(callback) {
        var resultList = [];
        if (sessionStorage.getItem(this.data.sessionKey_MealReson) == null) {
            axios()
                .get("/Data/GetReasonsForMeal", {})
                .then(response => {
                    response.data.forEach(comp => {
                        resultList.push({ value: comp.ID, text: comp.Text });
                    });
                    sessionStorage.setItem(this.data.sessionKey_MealReson, JSON.stringify(resultList));
                    callback(resultList);
                })
                .catch(error => {
                    console.log(error);
                });

        }
        else {
            resultList = JSON.parse(sessionStorage.getItem(this.data.sessionKey_MealReson));
            callback(resultList);
        }
    },
    getCountries(callback) {
        var resultList = [];
        if (sessionStorage.getItem(this.data.sessionKey_Country) == null) {
            axios()
                .get("/Data/GetCountries", {})
                .then(response => {
                    response.data.forEach(item => {
                        resultList.push({
                            text: item.Text,
                            value: item.Key
                        });
                    });
                    sessionStorage.setItem(this.data.sessionKey_Country, JSON.stringify(resultList));
                    callback(resultList);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {

            resultList = JSON.parse(sessionStorage.getItem(this.data.sessionKey_Country));
            callback(resultList);
        }
    },
    getCostCenter(callback) {
        var resultList = [];
        if (sessionStorage.getItem(this.data.sessionKey_CostCenter) == null) {
            axios()
                .get("/Data/GetCostCenters", {})
                .then(response => {
                    response.data.forEach(item => {
                        resultList.push({
                            text: item.Text,
                            value: item.ID
                        });
                    });
                    sessionStorage.setItem(this.data.sessionKey_CostCenter, JSON.stringify(resultList));
                    callback(resultList);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            resultList = JSON.parse(sessionStorage.getItem(this.data.sessionKey_CostCenter));
            callback(resultList);
        }
    },
    getCompany(callback) {
        var resultList = [];
        if (sessionStorage.getItem(this.data.sessionKey_Company) == null) {
            axios()
                .get("/Data/GetCompanies", {})
                .then(response => {
                    response.data.forEach(comp => {
                        resultList.push({ value: comp.ID, text: comp.Text });
                    });
                    sessionStorage.setItem(this.data.sessionKey_Company, JSON.stringify(resultList));
                    callback(resultList);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            resultList = JSON.parse(sessionStorage.getItem(this.data.sessionKey_Company));
            callback(resultList);
        }
    },
    getExpenseType(costCenterID, callback) {
        var resultList = [];
        var sessionKey = this.data.sessionKey_ExpenseType + costCenterID;
        if (sessionStorage.getItem(sessionKey) == null) {
            axios()
                .get("/Data/GetExpenseTypes/" + costCenterID, {})
                .then(response => {
                    response.data.forEach(expenseType => {
                        resultList.push({
                            value: expenseType.ID,
                            text: expenseType.Text
                        });
                    });
                    sessionStorage.setItem(sessionKey, JSON.stringify(resultList));
                    callback(resultList);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            resultList = JSON.parse(sessionStorage.getItem(sessionKey));
            callback(resultList);
        }
    },
    getCityType(callback) {
        var resultList = [];
        if (sessionStorage.getItem(this.data.sessionKey_CityTypes) == null) {
            axios()
                .get("/Data/CityTypes", {})
                .then(response => {
                    resultList = response.data;
                    sessionStorage.setItem(this.data.sessionKey_CityTypes, JSON.stringify(resultList));
                    callback(resultList);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            resultList = JSON.parse(sessionStorage.getItem(this.data.sessionKey_CityTypes));
            callback(resultList);
        }
    },
    getCurrentUserManager(callback) {
        var resultList = [];
        if (sessionStorage.getItem(this.data.sessionKey_CurrentUserManager) == null) {
            axios()
                .get("/Data/GetCurrentUserManager", {})
                .then(response => {
                    response.data.forEach(item => {
                        resultList.push({
                            text: item.FirstName,
                            value: item.EmployeeID
                        });
                    });
                    sessionStorage.setItem(this.data.sessionKey_CurrentUserManager, JSON.stringify(resultList));
                    callback(resultList);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            resultList = JSON.parse(sessionStorage.getItem(this.data.sessionKey_CurrentUserManager));
            callback(resultList);
        }
    },
    getCurrentUser(callback) {

        var result = Object;
        if (sessionStorage.getItem(this.data.sessionKey_CurrentUser) == null) {
            axios()
                .get("/Data/GetCurrentUser", {})
                .then(response => {
                    result = response.data;
                    sessionStorage.setItem(this.data.sessionKey_CurrentUser, JSON.stringify(result));
                    callback(result);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            result = JSON.parse(sessionStorage.getItem(this.data.sessionKey_CurrentUser));
            callback(result);
        }
    },
    getVersion(callback) {
        var result = "";
        if (sessionStorage.getItem(this.data.sessionKey_Version) == null) {
            axios()
                .get("/Data/GetVersion", {})
                .then(response => {
                    result = response.data;
                    sessionStorage.setItem(this.data.sessionKey_Version, JSON.stringify(result));
                    callback(result);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            result = JSON.parse(sessionStorage.getItem(this.data.sessionKey_Version));
            callback(result);
        }
    },
    clearExpenseReportList(typeID) {
        var key = typeID == 1 ? this.data.sessionKey_MyExpenseList : this.data.sessionKey_MyApproveList;
        if (sessionStorage.getItem(key) != null) {
            sessionStorage.removeItem(key);
        }
    },
    getExpenseReportList(typeID, callback) {
        var key = typeID == 1 ? this.data.sessionKey_MyExpenseList : this.data.sessionKey_MyApproveList;
        if (sessionStorage.getItem(key) == null) {
            axios()
                .get("/ExpenseReport/GetExpenseStatusList", {
                    params: {
                        typeID: typeID,
                    }
                })
                .then(response => {
                    var _key = response.data.TypeId == 1 ? this.data.sessionKey_MyExpenseList : this.data.sessionKey_MyApproveList;
                    sessionStorage.setItem(_key, JSON.stringify(response.data.Items));
                    callback(response.data.Items);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else
            callback(JSON.parse(sessionStorage.getItem(key)));
    },
    updateExpenseReportList(report) {
        var list = [];
        var targetKey = "";
        var ischanged = false;
        if (sessionStorage.getItem(this.data.sessionKey_MyExpenseList) != null) {
            list = JSON.parse(sessionStorage.getItem(this.data.sessionKey_MyExpenseList));
            if(list.length>0){
                list.forEach(item => {
                    if (item.ExpenseReportID == report.ExpenseReportID)
                        targetKey = this.data.sessionKey_MyExpenseList;
                });
            }else{
                list.push(report);
                targetKey = this.data.sessionKey_MyExpenseList;
            }
        }
        if (targetKey == "") {
            if (sessionStorage.getItem(this.data.sessionKey_MyApproveList) != null) {
                list = JSON.parse(sessionStorage.getItem(this.data.sessionKey_MyApproveList));
                list.forEach(item => {
                    if (item.ExpenseReportID == report.ExpenseReportID)
                        targetKey = this.data.sessionKey_MyApproveList;
                });
            }
        }
        if (list.length > 0 && targetKey != "") {
            for (var i = 0; i < list.length; i++) {
                if (list[i].ExpenseReportID == report.ExpenseReportID) {
                    if (report.Description != "")
                        list[i].Description = report.Description;
                    if (report.AmountChange && report.AmountChange != 0)
                        list[i].NetTotal += report.AmountChange;
                    else{
                        if(report.NetTotal!=undefined)
                            list[i].NetTotal=report.NetTotal;
                        else
                            list[i].NetTotal=list[i].NetTotal;
                    }
                    if (report.RedFlagCountChange && report.RedFlagCountChange != 0)
                        list[i].RedFlag_Count += report.RedFlagCountChange;
                    if (report.Status != "")
                        list[i].Status = report.Status;
                    ischanged = true;
                    break;
                }
            }
        }
        else {
            list = JSON.parse(sessionStorage.getItem(this.data.sessionKey_MyExpenseList));
            if (list && list.length > 0) {
                list.splice(0, 0, report);
                targetKey = this.data.sessionKey_MyExpenseList;
                ischanged = true;
            }
        }
        if (ischanged) {
            sessionStorage.setItem(targetKey, JSON.stringify(list));
        }
    },
    getPagedExpenseReportList(typeID, pageSize, pageIndex, callback) {


        this.getExpenseReportList(typeID, totalList => {
            var result = Object;
            result.PageIndex = pageIndex;
            result.PageSize = pageSize;
            result.Items = [];
            var yusu = totalList.length % pageSize;
            var mo = parseInt(totalList.length / pageSize);
            result.PageQty = yusu > 0 ? mo + 1 : mo;
            if (pageIndex > 1) {
                result.Items.push(this.pagingList(totalList, pageIndex - 2, pageSize));
                result.Items.push(this.pagingList(totalList, pageIndex - 1, pageSize));
            }
            else if (pageIndex == 1)
                result.Items.push(this.pagingList(totalList, pageIndex - 1, pageSize));
            if (pageIndex < result.PageQty)
                result.Items.push(this.pagingList(totalList, pageIndex, pageSize));
            callback(result);
        })
    },
    pagingList(list, skipPageIndex, pageSize) {
        var resultList = [];
        for (var i = (skipPageIndex * pageSize); i < list.length && i < ((skipPageIndex * pageSize + pageSize + 1)); i++) {
            resultList.push(list[i]);
        }
        return resultList;
    },
    getExpenseReport(reportID, callback) {
        var key = this.data.sessionKey_ExpenseReport + reportID;
        if (sessionStorage.getItem(key) == null) {
            axios()
                .get("/ExpenseReport/GetExpenseReport", { params: { id: reportID } })
                .then(response => {
                    sessionStorage.setItem(key, JSON.stringify(response.data));
                    console.log(response);
                    callback(response.data);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else {
            var a = JSON.parse(sessionStorage.getItem(key));
            callback(JSON.parse(sessionStorage.getItem(key)));
        }

    },
    deleteExpseReport(reportID, typeID) {
        var key = typeID == 1 ? this.data.sessionKey_MyExpenseList : this.data.sessionKey_MyApproveList;
        var isDeleted = false;
        if (sessionStorage.getItem(key) != null) {
            var list = JSON.parse(sessionStorage.getItem(key));
            for (var i = 0; i < list.length; i++) {
                if (list[i].ExpenseReportID == reportID) {
                    list.splice(i, 1);
                    isDeleted = true;
                    break;
                }
            }
            if (isDeleted && list.length>0) 
                sessionStorage.setItem(key, JSON.stringify(list));
            else 
                sessionStorage.removeItem(key);

        }
    },
    addExpenseReport(report) {
        var newReport = {
            ExpenseReportID: report.ExpenseReportID,
            CreationDate: "",
            Description: report.Description,
            EmpApproved: 0,
            MgrApproved: 0,
            APApproved: 0,
            NetTotal: report.NetTotal||0,
            RedFlag_Count: 0,
            Status: report.ReportStatus.Status,
            Viewable_AP: 0,
            CostCenterNo: "",
            APPaidDate: null,
            FirstName: "",
            LastName: "",
            Traveler: null,
            AttachmentCount: 0
        };
        this.getCurrentUser(result => {
            newReport.FirstName = result.FirstName;
            newReport.LastName = result.LastName;
            newReport.CreationDate = "/Date(" + Date.parse(new Date()) + ")/";
            this.updateExpenseReportList(newReport);
        });
    },
    updateExpenseReportForItem(reportID, itemAmount, costCenterID, description, status, cashAdvanced, cashRetured, creditCardRefund, redFlagCountChange) {
        var key = this.data.sessionKey_ExpenseReport + reportID;
        var isChanged = false;
        if (sessionStorage.getItem(key) != null) {
            var report = JSON.parse(sessionStorage.getItem(key));
            if (itemAmount != 0) {
                report.ReportAccount.GrandTotal += itemAmount;
                report.ReportAccount.NetTotal += itemAmount;
                report.ReportAccount.TotalClaim += itemAmount;
                isChanged = true;
            }
            if (costCenterID != 0) {
                report.CostCenterID = costCenterID;
            }
            if (description != "") {
                report.Description = description;
                isChanged = true;
            }
            if (status != "")
                report.ReportStatus.Status = status;
            if (cashAdvanced != 0)
                report.ReportAccount.CashAdvanced = cashAdvanced;
            if (cashRetured != 0)
                report.ReportAccount.CashReturned = cashRetured;
            if (creditCardRefund != 0)
                report.ReportAccount.CreditCardRefund = creditCardRefund;
            if (redFlagCountChange != 0)
                isChanged = true;
            sessionStorage.setItem(key, JSON.stringify(report));
        }
        if (isChanged) {
            var newReport = {
                ExpenseReportID: reportID,
                AmountChange: itemAmount,
                Description: description,
                RedFlagCountChange: redFlagCountChange,
                Status: "",
            }
            this.updateExpenseReportList(newReport);
        }
    },
    updateExpenseReport(report) {
        var key = this.data.sessionKey_ExpenseReport + report.ExpenseReportID;
        if (sessionStorage.getItem(key) != null) {
            sessionStorage.setItem(key, JSON.stringify(report));
            var newReport = {
                ExpenseReportID: report.ExpenseReportID,
                AmountChange: 0,
                Description: report.Description,
                RedFlagCountChange: 0,
                Status: report.ReportStatus.Status,
                NetTotal:report.NetTotal||0,
            }
            this.updateExpenseReportList(newReport);
        }
    },
    clearExpenseReport(reportID) {
        var key = this.data.sessionKey_ExpenseReport + reportID;
        if (sessionStorage.getItem(key) != null) {
            sessionStorage.removeItem(key);
        }
    },
    clearExpenseItemList(reportID) {
        var key = this.data.sessionKey_ExpenseItems + reportID;
        if (sessionStorage.getItem(key) != null) {
            sessionStorage.removeItem(key);
        }
    },
    getExpenseItemList(reportID, callback) {

        var key = this.data.sessionKey_ExpenseItems + reportID;
        if (sessionStorage.getItem(key) == null) {
            axios()
                .get("/ExpenseReport/GetExpenseItemList", {
                    params: {
                        expenseReportID: reportID,
                    }
                })
                .then(response => {
                    var list = response.data;
                    if (list == null || list == "")
                        list = [];
                    sessionStorage.setItem(key, JSON.stringify(list));
                    callback(response.data);
                })
                .catch(error => {
                    console.log(error);
                });
        }
        else
            callback(JSON.parse(sessionStorage.getItem(key)));
    },
    updateExpenseItem(item, isModify) {
        var key = this.data.sessionKey_ExpenseItems + item.ExpenseReportID;
        var changeAmount = 0;
        var changeRedFlagCount = 0;
        if (sessionStorage.getItem(key) != null) {
            var list = JSON.parse(sessionStorage.getItem(key));
            if (!isModify) {
                list.push(item);
                changeAmount = item.ClaimAmountReimburseCurr;
                changeRedFlagCount = item.RedFlagCount;
            }
            else {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].ExpenseItemID == item.ExpenseItemID) {
                        changeAmount = item.ClaimAmountReimburseCurr - list[i].ClaimAmountReimburseCurr;
                        changeRedFlagCount = item.RedFlagCount - list[i].RedFlagCount;
                        list[i] = item;
                        break;
                    }
                }
            }
            sessionStorage.setItem(key, JSON.stringify(list));

            this.updateExpenseReportForItem(item.ExpenseReportID, changeAmount, 0, "", "", 0, 0, 0, changeRedFlagCount);
        }
    },
    deleExpenseItem(reportID, expenseItemID) {
        var key = this.data.sessionKey_ExpenseItems + reportID;
        var isDeleted = false;
        var amount = 0;
        var redFlagCount = 0;
        if (sessionStorage.getItem(key) != null) {
            var list = JSON.parse(sessionStorage.getItem(key));
            for (var i = 0; i < list.length; i++) {
                if (list[i].ExpenseItemID == expenseItemID) {
                    amount = list[i].ClaimAmountReimburseCurr;
                    redFlagCount = list[i].RedFlagCount
                    list.splice(i, 1);
                    isDeleted = true;
                    break;
                }
            }
            if (isDeleted) {
                sessionStorage.setItem(key, JSON.stringify(list));
                this.updateExpenseReportForItem(reportID, -amount, 0, "", "", 0, 0, 0, -redFlagCount);
            }
        }
    },
    getPagedExpenseItemList(reportID, pageSize, pageIndex, callback) {

        var result = Object;
        result.PageIndex = pageIndex;
        result.PageSize = pageSize;
        result.Items = [];
        this.getExpenseItemList(reportID, totalList => {
            var yusu = totalList.length % pageSize;
            var mo = parseInt(totalList.length / pageSize);
            result.PageQty = yusu > 0 ? mo + 1 : mo;
            if (pageIndex > 1) {
                result.Items.push(this.pagingList(totalList, pageIndex - 2, pageSize));
                result.Items.push(this.pagingList(totalList, pageIndex - 1, pageSize));
            }
            else if (pageIndex == 1)
                result.Items.push(this.pagingList(totalList, pageIndex - 1, pageSize));
            if (pageIndex < result.PageQty)
                result.Items.push(this.pagingList(totalList, pageIndex, pageSize));
            callback(result);
        })
    },
    getIsDisplayMyExpense(callback) {
        var result = Object;
        axios()
            .get("/Data/IsDisplayMyExpense", {})
            .then(response => {
                result = response.data;
                callback(result);
            })
            .catch(error => {
                console.log(error);
            });
    },
    getExtraTitle(callback) {
        var result = Object;
        axios()
            .get("/Data/ExtraTitle", {})
            .then(response => {
                result = response.data;
                callback(result);
            })
            .catch(error => {
                console.log(error);
            });
    },
    clearNoNum(value){
        var val=String(value);
        val = val.replace(/[^\d.]/g, "");
        val = val.replace(/^\./g, "");
        val = val.replace(/\.{2,}/g, ".");
        val = val.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        return val;
      },
      PositiveInt(value){
        var val=String(value);
        val=val.replace(/[^0-9]/g,"");
        return val;
      },

};