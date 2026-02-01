import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Shield, User } from 'lucide-react';

// Mock users data
const MOCK_USERS = [
  {
    id: '1',
    fullName: 'Админ Пользователь',
    email: 'admin@doscoding.kz',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01',
    lastLogin: '2024-01-15',
  },
  {
    id: '2',
    fullName: 'Студент Тестов',
    email: 'student@doscoding.kz',
    role: 'user',
    isActive: true,
    createdAt: '2024-01-10',
    lastLogin: '2024-01-14',
  },
  {
    id: '3',
    fullName: 'Aibek Tolegenov',
    email: 'aibek@example.com',
    role: 'user',
    isActive: true,
    createdAt: '2024-01-05',
    lastLogin: '2024-01-13',
  },
  {
    id: '4',
    fullName: 'Dana Nurmukhanova',
    email: 'dana@example.com',
    role: 'user',
    isActive: false,
    createdAt: '2024-01-08',
    lastLogin: null,
  },
];

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  const filteredUsers = MOCK_USERS.filter(
    (user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t.admin.users}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage platform users
          </p>
        </div>
        <Button className="btn-primary-gradient gap-2">
          <Plus className="w-4 h-4" />
          {t.admin.createUser}
        </Button>
      </div>

      {/* Search */}
      <div className="card-elevated p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t.filters.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                    className="gap-1"
                  >
                    {user.role === 'admin' ? (
                      <Shield className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'outline' : 'destructive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.lastLogin || 'Never'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2">
                        <Edit className="w-4 h-4" />
                        {t.admin.editUser}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-destructive">
                        <Trash2 className="w-4 h-4" />
                        {t.admin.deleteUser}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
