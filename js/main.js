function download(tableBody, sortFieldIdx, fieldsIdx) {
    sortData = getSortData(tableBody, sortFieldIdx, fieldsIdx);
    sortData.unshift(fieldsIdx.map(function (idx) {
        return tableBody[0][idx]
    }));
    let csvContent = sortData.map(function (row) {
        return row.map(function (val) {
            if (!val) return val;
            else return val.toString().indexOf(',') === -1 ? val : '"' + val + '"'
        });
    }).join("\n");

    if (window.navigator.msSaveBlob) {
        //Internet Explorer
        window.navigator.msSaveBlob(new Blob([csvContent]), 'my_data.csv');
    } else if (window.webkitURL != null) {
        //Google Chrome and Mozilla Firefox
        var a = document.createElement("a");
        result = encodeURIComponent(csvContent);
        a.href = "data:application/csv;charset=UTF-8," + csvContent;
        a.download = 'my_data.csv';
        a.click();
    } else if (navigator.appName === "Microsoft Internet Explorer") {
        //Internet Explorer 8 and 9
        var oWin = window.open();
        oWin.document.write("sep=,\r\n" + csvContent);
        oWin.document.close();
        oWin.document.execCommand("SaveAs", true, 'my_data.csv');
        oWin.close();
    } else {
        //Everything Else
        window.open(result);
    }
}

function formatDate(date) {
    if (!date)
        return ''
    d = Date.parse(date);
    if (isNaN(d) == true) {
        dtStr = date.substring(0, 4) + '/' + date.substring(4, 6) + '/' + date.substring(6);
        d = Date.parse(dtStr);
        if (isNaN(d) == true) {
            res = formatDateIE(date)
            if (res == false)
                return "can't format this " + date;
            return res;
        }
    }
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'UTC' }).format(d)
    const mo = new Intl.DateTimeFormat('en', { month: 'numeric', timeZone: 'UTC' }).format(d)
    const da = new Intl.DateTimeFormat('en', { day: '2-digit', timeZone: 'UTC' }).format(d)
    res = mo + "/" + da + "/" + ye;

    return res;
}

function formatDateIE(date) {
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var num_months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    var month = date.split('-')[1];
    for (var i = 0; i < months.length; i++) {
        if (months[i] == month.toUpperCase()) {
            month = num_months[i];
            break;
        }
    }
    if (month === date.split('-')[1]) {
        return false;
    }
    year = date.split('-')[2];
    if (year.length === 2) {
        year = '20' + year;
    }
    result = month + '/' + date.split('-')[0] + '/' + year;
    return result;
}

function thousands_delimiter_with_2_decimals(value) {
    try {
        value = value.split(',').join('');
    } catch (err) {
        value;
    }
    decimals = parseFloat(value).toFixed(2);
    thousands = decimals.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return thousands;
}

function number_with_decimals(value, n) {
    if (value == '-') return '-';
    decimals = parseFloat(value).toFixed(n);
    return parseFloat(decimals);
}

function currency_with_2_decimals(value) {
    try {
        value = value.split(',').join('');
    } catch (err) {
        value;
    }
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    })

    return formatter.format(value);
}

function currency_no_decimals(value) {
    try {
        value = value.split(',').join('');
    } catch (err) {
        value;
    }
    decimals = parseFloat(value).toFixed(0);
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    })

    return formatter.format(decimals);
}

function thousands_delimiter_no_decimals(value) {
    try {
        value = value.split(',').join('');
    } catch (err) {
        value;
    }

    int = parseInt(value);
    thousands = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return thousands;
}

function ObjectToArray(object) {
    return Object.keys(object).map(function (key) {
        return object[key];
    })
}

function getSortData(origin_data, sortFieldIdx, fieldIndexes, header=true) {
    table_body = [];
    for (let i = ( header==true ? 1 : 0); i < origin_data.length; i++) {
        // if (origin_data[i][1] == account) {
        table_body.push(origin_data[i])
        // }
    }
    if (sortFieldIdx) {
        sortData = table_body.sort(function (a, b) { return a[sortFieldIdx].toString().split('%')[0] - b[sortFieldIdx].toString().split('%')[0] }).reverse()
            .map(function (row, idx) {
                return fieldIndexes.map(function (idx) { return row[idx] });
            });
    }
    else {
        sortData = table_body.sort(function (a, b) { return a.toString().split('%')[0] - b.toString().split('%')[0] })
            .map(function (row, idx) {
                return fieldIndexes.map(function (idx) { return row[idx] });
            });
    }
    return sortData;
}

function generateHtmlTable(data, sortFieldIdx, fieldIndexes, rows, setClass) {
    var html = '<table  class="table table-condensed table-hover table-striped" style="margin-top: 10px" indexes=' + fieldIndexes + '>';

    if (!setClass) {
        if (typeof (data[0]) === 'undefined') {
            return null;
        } else {
            html += '<thead>';
            html += '<tr>';
            fieldIndexes.forEach(function (idx) {
                html += '<th>';
                html += data[0][idx];
                html += '</th>';
            });
            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            sortData = getSortData(data, sortFieldIdx, fieldIndexes);
            $.each(sortData, function (index, row) {
                if (index >= rows) {
                    return null;
                }
                html += '<tr>';
                $.each(row, function (index, colData) {
                    html += '<td>';
                    html += colData;
                    html += '</td>';
                });
                html += '</tr>';
            });
            html += '</tbody>';
            html += '</table>';
            return html;
        }
    }
    else {
        if (typeof (data[0]) === 'undefined') {
            return null;
        } else {
            html += '<thead>';
            html += '<tr>';
            fieldIndexes.forEach(function (idx) {
                html += '<th style="text-align: center">';
                html += data[0][idx];
                html += '</th>';
            });
            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            sortData = getSortData(data, sortFieldIdx, fieldIndexes);
            $.each(sortData, function (index, row) {
                if (index >= rows) {
                    return null;
                }
                html += '<tr>';
                $.each(row, function (index, colData) {
                    if (index === 0) {
                        html += '<td style="text-left: center">';
                        if (index === 0) {
                            html += '<strong >';
                            html += colData;
                            html += '</strong>';
                        }
                        else {
                            html += '<span ' + 'class=' + '"' + setClass[index] + '"' + '>';
                            html += colData;
                            html += '</span>';
                        }
                        html += '</td>';
                    }
                    else {
                        html += '<td style="text-align: center">';
                        if (index === 0) {
                            html += '<strong >';
                            html += colData;
                            html += '</strong>';
                        }
                        else {
                            html += '<span ' + 'class=' + '"' + setClass[index] + '"' + '>';
                            html += colData;
                            html += '</span>';
                        }
                        html += '</td>';
                    }
                });
                html += '</tr>';
            });
            html += '</tbody>';
            html += '</table>';
            return html;
        }
    }
}