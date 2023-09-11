"use client"
import fetchContent from "@/fetchContent";
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

function TableDisplay() {
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const query = `
        {
          tableConfigurationCollection {
            items {
              tableName
              tableData {
                url
              }
            }
          }
        }
      `;

      const response = await fetchContent(query);

      const tableConfigurations = response.tableConfigurationCollection.items;

      // Fetch and process table data here based on the URLs in tableConfigurations
      const fetchedTableData = await Promise.all(
        tableConfigurations.map(async (config: any) => {
          const response = await fetch(config.tableData.url);
          const fileContent = await response.arrayBuffer();

          let parsedData;

          if (config.tableData.url.endsWith(".csv")) {
            // Parse CSV data using PapaParse
            const textData = new TextDecoder().decode(fileContent);
            const parsedCsv = Papa.parse(textData, { header: true });
            parsedData = {
              headers: parsedCsv.meta.fields,
              rows: parsedCsv.data.map((row: any) => Object.values(row)),
            };
          } else if (config.tableData.url.endsWith(".xlsx")) {
            // Parse Excel data using XLSX
            const workbook = XLSX.read(fileContent, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const parsedExcel = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const [headers, ...rows] = parsedExcel;
            parsedData = {
              headers,
              rows,
            };
          }

          return {
            tableName: config.tableName,
            tableData: parsedData,
          };
        })
      );

      setTableData(fetchedTableData);
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mr-3">
      {tableData.map((table, index) => (
        <div key={index} className="mb-10">
          <h1 className="text-2xl font-semibold mb-4">{table.tableName}</h1>
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                {table.tableData.headers.map((header: string, headerIndex: number) => (
                  <th key={headerIndex} className="border px-4 py-2 text-red-500">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.tableData.rows.map((row: any[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.map((cell: any, cellIndex: number) => (
                    <td key={cellIndex} className="border px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default TableDisplay;
