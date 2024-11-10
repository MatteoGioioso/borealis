// ==============================|| OVERRIDES - CARD CONTENT ||============================== //

export default function Alert() {
  return {
    MuiAlert: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': {
            paddingBottom: 20
          }
        }
      }
    }
  };
}
