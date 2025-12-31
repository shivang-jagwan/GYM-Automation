// src/pages/Members.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users,
  Phone,
  Calendar,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { 
  Button, 
  Badge, 
  Table, 
  LoadingSkeleton, 
  EmptyState, 
  PageTransition,
  ConfirmDialog,
  SearchInput
} from '../components/ui';

function Members() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ open: false, member: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/members/');
      setMembers(res.data);
      setFilteredMembers(res.data);
    } catch (err) {
      setError('Failed to load members');
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  // Filter members based on search and status
  useEffect(() => {
    let result = members;
    
    if (searchTerm) {
      result = result.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.includes(searchTerm)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(m => m.status.toLowerCase() === statusFilter);
    }
    
    setFilteredMembers(result);
  }, [searchTerm, statusFilter, members]);

  const handleDelete = async () => {
    if (!deleteModal.member) return;
    
    setDeleteLoading(true);
    try {
      await api.delete(`/api/members/${deleteModal.member.id}/`);
      setMembers(members.filter(m => m.id !== deleteModal.member.id));
      toast.success('Member deleted successfully');
      setDeleteModal({ open: false, member: null });
    } catch {
      toast.error('Failed to delete member');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return <Badge variant="success" dot>{status}</Badge>;
    if (statusLower === 'expired') return <Badge variant="danger" dot>{status}</Badge>;
    if (statusLower === 'expiring soon') return <Badge variant="warning" dot>{status}</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getPlanBadge = (plan) => {
    if (plan === 'both') return <Badge variant="primary">Strength + Cardio</Badge>;
    if (plan === 'strength') return <Badge variant="info">Strength</Badge>;
    if (plan === 'cardio') return <Badge variant="warning">Cardio</Badge>;
    return <Badge variant="secondary">{plan}</Badge>;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <LoadingSkeleton className="h-8 w-32" />
            <LoadingSkeleton className="h-10 w-32" />
          </div>
          <LoadingSkeleton.Table rows={5} columns={7} />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <EmptyState
          icon={Users}
          title="Error Loading Members"
          description={error}
          action={Plus}
          actionLabel="Try Again"
          onAction={fetchMembers}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-900">Members</h2>
          <p className="text-sm sm:text-base text-dark-500 mt-0.5 sm:mt-1">{members.length} total members</p>
        </div>
        <Button 
          onClick={() => navigate('/members/add')} 
          icon={Plus}
          className="w-full sm:w-auto"
        >
          Add Member
        </Button>
      </div>

      {/* Filters - Stack on mobile */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-card p-3 sm:p-4 mb-4 sm:mb-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or phone..."
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-dark-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-dark-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="expiring soon">Expiring Soon</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Table - Responsive with horizontal scroll hint */}
      {filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Members Found"
          description={searchTerm || statusFilter !== 'all' 
            ? "No members match your search criteria" 
            : "Get started by adding your first member"
          }
          action={Plus}
          actionLabel="Add Member"
          onAction={() => navigate('/members/add')}
        />
      ) : (
        <div className="relative">
          {/* Scroll hint for mobile */}
          <div className="sm:hidden text-xs text-dark-400 mb-2 flex items-center gap-1">
            <span>← Scroll horizontally →</span>
          </div>
          <Table>
            <Table.Head>
              <tr>
                <Table.Header>Name</Table.Header>
                <Table.Header>Phone</Table.Header>
                <Table.Header hideOnMobile>Plan</Table.Header>
                <Table.Header hideOnMobile>Start Date</Table.Header>
                <Table.Header hideOnMobile>End Date</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header className="text-right">Actions</Table.Header>
              </tr>
            </Table.Head>
            <Table.Body>
              <AnimatePresence>
                {filteredMembers.map((member, index) => (
                  <Table.Row key={member.id} index={index}>
                    <Table.Cell>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-dark-900 truncate">{member.name}</p>
                          {/* Show phone on mobile under name */}
                          <p className="sm:hidden text-xs text-dark-500">{member.phone}</p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-dark-600">
                        <Phone className="w-4 h-4" />
                        {member.phone}
                      </div>
                    </Table.Cell>
                    <Table.Cell hideOnMobile>{getPlanBadge(member.membership_plan)}</Table.Cell>
                    <Table.Cell hideOnMobile>
                      <div className="flex items-center gap-2 text-dark-600">
                        <Calendar className="w-4 h-4" />
                        {member.start_date}
                      </div>
                    </Table.Cell>
                    <Table.Cell hideOnMobile>
                      <span className="text-dark-600">{member.end_date}</span>
                    </Table.Cell>
                    <Table.Cell>{getStatusBadge(member.status)}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <motion.button
                          onClick={() => navigate(`/members/edit/${member.id}`)}
                          className="p-1.5 sm:p-2 rounded-lg text-dark-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => setDeleteModal({ open: true, member })}
                          className="p-1.5 sm:p-2 rounded-lg text-dark-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </AnimatePresence>
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, member: null })}
        onConfirm={handleDelete}
        title="Delete Member"
        message={`Are you sure you want to delete ${deleteModal.member?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </PageTransition>
  );
}

export default Members;
