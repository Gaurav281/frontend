import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{ margin: '8px' }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--toast-bg, #363636)',
          color: 'var(--toast-color, #fff)',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '500px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        },
        success: {
          style: {
            background: '#10b981',
            color: '#fff'
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981'
          }
        },
        error: {
          style: {
            background: '#ef4444',
            color: '#fff'
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444'
          },
          duration: 5000
        },
        loading: {
          style: {
            background: '#3b82f6',
            color: '#fff'
          },
          duration: Infinity
        }
      }}
    />
  );
};

export default ToastProvider;