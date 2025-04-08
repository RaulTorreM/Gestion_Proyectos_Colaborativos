export const styles = {
  container: {
    p: { xs: 2, md: 4 },
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    maxWidth: 1200,
    mx: 'auto',
    bgcolor: 'background.default'
  },
  header: {
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 1,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: 3
    }
  },
  title: {
    mb: 2,
    fontWeight: 700,
    color: 'primary.main',
    fontSize: { xs: '1.5rem', md: '2rem' },
    letterSpacing: 0.5
  },
  dates: {
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    '& .MuiTypography-root': {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      '&:before': {
        content: '""',
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: 'primary.main'
      }
    }
  },
  section: {
    p: 3,
    bgcolor: 'background.paper',
    borderRadius: 3,
    boxShadow: 1,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: 2
    }
  },
  sectionTitle: {
    mb: 2,
    fontWeight: 600,
    color: 'text.secondary',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    '&:after': {
      content: '""',
      flexGrow: 1,
      height: 1,
      bgcolor: 'divider',
      ml: 2
    }
  },
  description: {
    whiteSpace: 'pre-line',
    lineHeight: 1.8,
    color: 'text.secondary',
    px: 1
  },
  membersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1.5,
    py: 1
  },
  memberChip: {
    '& .MuiChip-avatar': {
      width: 34,
      height: 34
    },
    transition: 'all 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)'
    }
  },
  divider: {
    my: 3,
    borderColor: 'divider',
    borderBottomWidth: 2,
    borderStyle: 'dashed'
  },
  kanbanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
    flexWrap: 'wrap',
    gap: 2
  },
  kanbanTitle: {
    fontWeight: 600,
    color: 'text.primary',
    fontSize: '1.25rem',
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: -8,
      left: 0,
      width: '40%',
      height: 3,
      bgcolor: 'primary.main',
      borderRadius: 3
    }
  },
  editButton: {
    alignSelf: 'flex-start',
    px: 3,
    py: 1,
    fontWeight: 600,
    letterSpacing: 0.5,
    '& .MuiButton-startIcon': {
      mr: 0.5
    },
    '&:hover': {
      transform: 'translateY(-1px)'
    }
  },
  addButton: {
    px: 4,
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: 2,
    boxShadow: 1,
    '&:hover': {
      boxShadow: 3
    }
  },
  priorityChip: {
    fontWeight: 700,
    letterSpacing: 0.5,
    '&.Alta': {
      backgroundColor: '#ff5252',
      color: 'white'
    },
    '&.Media': {
      backgroundColor: '#ffeb3b',
      color: 'rgba(0, 0, 0, 0.87)'
    },
    '&.Baja': {
      backgroundColor: '#4caf50',
      color: 'white'
    }
  },
  prioritySelectItem: {
    '&.Alta': {
      color: '#ff5252',
      fontWeight: 600
    },
    '&.Media': {
      color: '#ff9800',
      fontWeight: 600
    },
    '&.Baja': {
      color: '#4caf50',
      fontWeight: 600
    }
  }
};