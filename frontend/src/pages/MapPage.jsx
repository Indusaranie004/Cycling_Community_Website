import { useAuth } from '../context/AuthContext';

export default function MapPage() {
  const { user} = useAuth();

  return (
    <div style={{ padding: '80px', textAlign: 'center', color: 'black' }}>
      <h1>🌍 Map Page</h1>
      <p>Welcome back, {user?.name}!</p>
    </div>
  );
}