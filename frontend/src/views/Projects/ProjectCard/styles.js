export const styles = (theme) => ({
  root: {
    width: '100%',
    height: '100%',
    minHeight: '320px', // Altura fija basada en la tarjeta más grande
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: theme.shadows[6],
      transform: 'translateY(-4px)'
    }
  },
  title: {
    fontWeight: 600,
    fontSize: '1.1rem',
    color: theme.palette.text.primary
  },
  avatar: {
    bgcolor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main),
    width: 40,
    height: 40
  },
  dateIcon: {
    fontSize: '1rem',
    color: theme.palette.text.secondary
  },
  dateText: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    fontSize: '0.75rem'
  },
  dateSeparator: {
    color: theme.palette.text.disabled,
    mx: 0.5
  },
  content: {
    flexGrow: 1,
    py: 1,
    px: 2,
    minHeight: '120px' // Espacio fijo para la descripción
  },
  description: {
    color: theme.palette.text.secondary,
    lineHeight: 1.5,
    fontSize: '0.875rem',
    display: '-webkit-box',
    WebkitLineClamp: 4, // Máximo 4 líneas
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  footer: {
    px: 2,
    pb: 2,
    pt: 1
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 1
  },
  progressLabel: {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    fontSize: '0.75rem'
  },
  progressValue: {
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: '0.875rem'
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    mb: 2,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
      borderRadius: 4
    }
  },
  teamLabel: {
    display: 'block',
    color: theme.palette.text.secondary,
    fontWeight: 500,
    fontSize: '0.75rem',
    mb: 1
  },
  membersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5)
  },
  memberAvatar: {
    width: 24,
    height: 24
  },
  memberChip: {
    '& .MuiChip-label': {
      fontSize: '0.7rem'
    }
  }
});