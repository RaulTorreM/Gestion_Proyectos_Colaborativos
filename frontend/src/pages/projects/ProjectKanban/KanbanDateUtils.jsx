export const formatDateToUserTimezone = (dateIsoString) => {
    if (!dateIsoString) return 'N/A';
    const date = new Date(dateIsoString);
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(date);
  };