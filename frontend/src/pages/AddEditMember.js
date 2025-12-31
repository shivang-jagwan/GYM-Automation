// src/pages/AddEditMember.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  Calendar, 
  DollarSign, 
  Clock,
  ArrowLeft,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Button, Input, Select, Card, PageTransition, LoadingSkeleton } from '../components/ui';

const PLAN_OPTIONS = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'both', label: 'Strength + Cardio' },
];

function AddEditMember() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    membership_plan: 'strength',
    start_date: '',
    duration_months: 1,
    amount_paid: '',
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      setPageLoading(true);
      api.get(`/api/members/${id}/`).then(res => {
        setForm({
          name: res.data.name,
          phone: res.data.phone,
          membership_plan: res.data.membership_plan,
          start_date: res.data.start_date,
          duration_months: res.data.duration_months,
          amount_paid: res.data.amount_paid,
        });
        setPageLoading(false);
      }).catch(() => {
        setError('Failed to load member');
        toast.error('Failed to load member data');
        setPageLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/api/members/${id}/`, form);
        toast.success('Member updated successfully');
      } else {
        await api.post('/api/members/', form);
        toast.success('Member added successfully');
      }
      navigate('/members');
    } catch {
      setError('Save failed');
      toast.error('Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <PageTransition>
        <div className="max-w-2xl mx-auto">
          <LoadingSkeleton className="h-8 w-48 mb-6" />
          <Card>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <LoadingSkeleton className="h-4 w-24" />
                  <LoadingSkeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        {/* Header - Responsive */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <motion.button
            onClick={() => navigate('/members')}
            className="p-2 rounded-lg text-dark-500 hover:bg-dark-100 transition-colors flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-dark-900 truncate">
              {isEdit ? 'Edit Member' : 'Add New Member'}
            </h2>
            <p className="text-sm sm:text-base text-dark-500 mt-0.5 sm:mt-1 truncate">
              {isEdit ? 'Update member information' : 'Fill in the member details below'}
            </p>
          </div>
        </div>

        {/* Form Card - Responsive padding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-card p-4 sm:p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-dark-900 mb-3 sm:mb-4 flex items-center gap-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                Personal Information
              </h3>
              {/* Single column on mobile, 2 columns on tablet+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                  icon={User}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                  icon={Phone}
                  required
                />
              </div>
            </div>

            {/* Membership Details */}
            <div className="pt-5 sm:pt-6 border-t border-dark-100">
              <h3 className="text-base sm:text-lg font-semibold text-dark-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                Membership Details
              </h3>
              {/* Single column on mobile, 2 columns on tablet+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Select
                  label="Membership Plan"
                  name="membership_plan"
                  value={form.membership_plan}
                  onChange={handleChange}
                  options={PLAN_OPTIONS}
                  required
                />
                <Input
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-dark-700">
                    Duration (Months) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-400" />
                    <input
                      name="duration_months"
                      type="number"
                      min="1"
                      value={form.duration_months}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 rounded-lg border border-dark-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-dark-700">
                    Amount Paid <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-dark-400" />
                    <input
                      name="amount_paid"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={form.amount_paid}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 sm:pl-11 pr-4 py-2.5 sm:py-3 rounded-lg border border-dark-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 sm:p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm sm:text-base"
              >
                {error}
              </motion.div>
            )}

            {/* Actions - Stack on mobile */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-5 sm:pt-6 border-t border-dark-100">
              <Button 
                type="button" 
                variant="secondary"
                onClick={() => navigate('/members')}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={loading}
                icon={Save}
                className="w-full sm:w-auto"
              >
                {isEdit ? 'Update Member' : 'Add Member'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
}

export default AddEditMember;
