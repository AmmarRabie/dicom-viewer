// create a react component using react with redux, that displays list of studies stored in the state
// study is of type Study that have {id: string, name: string}
// studies should be displayed in a table like format. use mui/material-ui if needed
// table row should have id, name, when clicked will go to /studies/{id} page

import { type ChangeEvent, useState } from "react"
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material"
import { useListQuery } from "../studiesApiSlice"
import { useNavigate } from "react-router-dom"
import type { Series, Study } from "../../../app/models"
import { UploadButton } from "../../../widgets/upload-btn/UploadButton";
import { environment } from "../../../environment/environment";

interface ColumnDef {
  id: "id" | "series"
  label: string
  minWidth?: number
  align?: "right"
  format: (value: any) => string
}

const columnDefs: readonly ColumnDef[] = [
  { id: "id", label: "ID", minWidth: 150, format: v => v },
  {
    id: "series",
    label: "Series",
    minWidth: 170,
    format: (series: Series[]) => {
      const allImagesCount = series.reduce(
        (pre, cur) => pre + cur.images.length,
        0,
      )
      return `${series.length} series (${allImagesCount} images)`
    },
  },
]

export default function StudiesListPage() {
  const { data, isError, isLoading, isSuccess, error } = useListQuery()
  const studies = data?.studies || []
  const navigate = useNavigate()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleRowClick = (study: Study) => {
    navigate(`/${study.id}`)
  }

  if (isError) return <div>Error: {JSON.stringify(error)}</div>
  if (isLoading) return <div>Loading</div>
  if (isSuccess && !studies.length) return <div>No studies yet</div>

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <UploadButton
        title="upload studies"
        upload_url={`${environment.apiUrl}/studies/upload`}
      />
      <TableContainer sx={{ maxHeight: 440 }}>
        {" "}
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columnDefs.map(columnDef => (
                <TableCell
                  key={columnDef.id}
                  align={columnDef.align}
                  style={{ minWidth: columnDef.minWidth }}
                >
                  {columnDef.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {studies
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map(row => {
                return (
                  <TableRow
                    onClick={() => handleRowClick(row)}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={row.id}
                  >
                    {columnDefs.map(colDef => {
                      const value = row[colDef.id]
                      return (
                        <TableCell key={colDef.id} align={colDef.align}>
                          {colDef.format(value)}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={studies.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}
