import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAllStudentsStats, useWeeklyStats } from '@/hooks/useAdminHomework';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { Users, Star, FileText, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminStats() {
  const { isAdmin } = useAuth();
  const { data: students, isLoading: studentsLoading } = useAllStudentsStats();
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyStats();

  if (!isAdmin) return <Navigate to="/app" replace />;

  const totalSubmissions = students?.reduce((s, st) => s + st.total_submissions, 0) || 0;
  const allScores = students?.flatMap(st => st.submissions.filter(s => s.score != null).map(s => s.score!)) || [];
  const overallAvg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;

  const weeklyChartData = (weeklyData || []).map(w => ({
    ...w,
    label: format(new Date(w.week), 'dd.MM'),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Апталық статистика</h1>
        <p className="text-muted-foreground mt-1">Студенттердің үй тапсырма нәтижелері</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{students?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Студенттер</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-muted">
              <FileText className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSubmissions}</p>
              <p className="text-xs text-muted-foreground">Барлық тапсырмалар</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overallAvg ?? '—'}</p>
              <p className="text-xs text-muted-foreground">Орташа балл</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{weeklyData?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Апталар</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Апталық тапсырмалар</CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : weeklyChartData.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Деректер жоқ</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" name="Қабылданды" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" name="Қайтарылды" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Күтілуде" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Weekly score trend */}
      {weeklyChartData.some(w => w.avgScore != null) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Орташа балл трендi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyChartData.filter(w => w.avgScore != null)}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" className="text-xs" />
                <YAxis domain={[0, 100]} className="text-xs" />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" name="Орташа балл" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Students table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Студенттер рейтингі</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Студент</TableHead>
                    <TableHead className="text-center">Орташа балл</TableHead>
                    <TableHead className="text-center">Барлығы</TableHead>
                    <TableHead className="text-center">Қабылданды</TableHead>
                    <TableHead className="text-center">Қайтарылды</TableHead>
                    <TableHead className="text-center">Күтілуде</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(students || [])
                    .sort((a, b) => (b.average_score ?? 0) - (a.average_score ?? 0))
                    .map((st) => {
                      const initials = st.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';
                      return (
                        <TableRow key={st.user_id}>
                          <TableCell>
                            <Link to={`/admin/students/${st.user_id}`} className="flex items-center gap-2 hover:underline">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={st.avatar_url || undefined} />
                                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{st.full_name || 'Аты белгісіз'}</span>
                            </Link>
                          </TableCell>
                          <TableCell className="text-center">
                            {st.average_score != null ? (
                              <Badge variant={st.average_score >= 70 ? 'default' : st.average_score >= 40 ? 'secondary' : 'destructive'}>
                                {st.average_score}
                              </Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-center">{st.total_submissions}</TableCell>
                          <TableCell className="text-center text-green-600">{st.approved_count}</TableCell>
                          <TableCell className="text-center text-destructive">{st.rejected_count}</TableCell>
                          <TableCell className="text-center text-muted-foreground">{st.pending_count}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
