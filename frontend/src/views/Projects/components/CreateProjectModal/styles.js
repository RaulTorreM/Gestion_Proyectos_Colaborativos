export const styles = {
    dialogTitle: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid #eee',
      pb: 2
    },
    closeButton: {
      color: 'text.secondary'
    },
    subtitle: {
      color: 'text.secondary',
      mb: 3
    },
    formContainer: {
      mt: 2,
      width: '100%'
    },
    field: {
      mb: 2
    },
    descriptionContainer: {
     position: 'relative',
     mb: 2
    },
    aiButton: {
        position: 'absolute',
        right: 16,
        top: 16,   
        textTransform: 'none',
        fontSize: '0.75rem',
        backgroundColor: 'background.paper',
        padding: '2px 8px',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      },
    dialogActions: {
      px: 3,
      py: 2,
      borderTop: '1px solid #eee'
    },
    cancelButton: {
      color: 'text.secondary'
    },
    submitButton: {
      ml: 2,
      px: 3
    }
  };