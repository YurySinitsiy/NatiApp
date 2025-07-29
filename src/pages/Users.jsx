import { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Button, Checkbox } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from 'react-router-dom';

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    setIsAllSelected(selectedIds.length > 0 && selectedIds.length === users.length);
    setIsIndeterminate(selectedIds.length > 0 && selectedIds.length < users.length);
  }, [selectedIds, users.length]);

  const checkAuth = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate('/login');
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_blocked')
        .eq('id', user.id)
        .single();

      if (profileError || profile?.is_blocked) {
        await handleLogOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      navigate('/login');
      return false;
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(users.map(user => user.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleRowSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!selectedIds.length) return;

    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;

      const { error } = await supabase.auth.admin.deleteUser(selectedIds);
      if (error) throw error;

      setUsers(users.filter(user => !selectedIds.includes(user.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  };

  const handleToggleBlock = async (block) => {
    if (!selectedIds.length) return;

    try {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) return;

      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: block })
        .in('id', selectedIds);

      if (error) throw error;

      setUsers(users.map(user =>
        selectedIds.includes(user.id) ? { ...user, is_blocked: block } : user
      ));
      setSelectedIds([]);

      await checkAuth();
    } catch (error) {
      console.error('Error updating users:', error);
    }

  };

  const handleLogOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  const columns = [
    {
      field: 'selection',
      disableColumnMenu: true,
      headerName: (
        <Checkbox
          checked={isAllSelected}
          indeterminate={isIndeterminate}
          onChange={handleSelectAll}
        />
      ),
      width: 50,
      sortable: false,
      renderCell: (params) => (
        <Checkbox
          checked={selectedIds.includes(params.id)}
          onChange={() => handleRowSelection(params.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      field: 'Name',
      headerName: 'Full name',
      minWidth: 50,
      maxWidth: 450,
      flex: 1,
      valueGetter: (value, params) => `${params.first_name || ""} ${params.last_name || ""}`,

    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 50,
      maxWidth: 450,
      flex: 1
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      minWidth: 50,
      maxWidth: 450,
      flex: 1,
      valueFormatter: (value, params) => new Date(params.created_at).toLocaleString()
    },
    {
      field: 'last_sign',
      headerName: 'Last sign',
      minWidth: 50,
      maxWidth: 450,
      flex: 1,
      valueFormatter: (value, params) => new Date(params.last_sign).toLocaleString()
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 50,
      maxWidth: 450,
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: params.row.is_blocked ? 'red' : 'green' }}>
          {params.row.is_blocked ? 'Blocked' : 'Active'}
        </span>
      )
    },
  ];
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        overflow: "auto",
        bgcolor: "rgba(0, 0, 0, 0.1)",
        background: "linear-gradient(45deg, #1fbfd1 30%, #d11f9f 90%)",
      }}
    >
      <Box
        sx={{
          flex: 1,
          width: "100%",
          minWidth: 600,
          height: "100%",
          overflow: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "flex-start",
          marginBottom: "15px",
          width: "100%",
          padding: "10px",
          backgroundColor: "white",
          borderRadius: "6px"
        }}>
          <Button
            variant="contained"
            disabled={!selectedIds.length}
            color="info">
            <span>Selected: {selectedIds.length} of {users.length}</span>
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={!selectedIds.length}
            style={{ marginRight: 8 }}
          >
            Delete Selected
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<LockIcon />}
            onClick={() => handleToggleBlock(true)}
            disabled={!selectedIds.length}
            style={{ marginRight: 8 }}
          >
            Block
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<LockOpenIcon />}
            onClick={() => handleToggleBlock(false)}
            disabled={!selectedIds.length}
          >
            Unblock
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ExitToAppIcon />}
            onClick={handleLogOut}
          >
            Exit
          </Button>
        </div>
        <DataGrid
          rows={users}
          columns={columns}
          checkboxSelection={false}
          disableSelectionOnClick
          components={{ Toolbar: GridToolbar }}
          onSelectionModelChange={(newSelection) => {
            setSelectedIds(newSelection);
          }}
          selectionModel={selectedIds}
          disableRowSelectionOnClick
          autoHeight
        />
      </Box>
    </Box >
  );
}