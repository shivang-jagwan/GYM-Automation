// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  TrendingUp,
  Activity,
  RefreshCw
} from 'lucide-react';
import api from '../api/axios';
import { Card, LoadingSkeleton, PageTransition } from '../components/ui';

// TWEAK 1: Helper function to format "last updated" time
function formatLastUpdated(date) {
  if (!date) return '';
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins === 1) return '1 minute ago';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return '1 hour ago';
  return `${diffHours} hours ago`;
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // TWEAK 1: Track last updated timestamp
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastUpdatedText, setLastUpdatedText] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/api/dashboard/');
        setStats(res.data);
        // TWEAK 1: Update timestamp on successful fetch
        setLastUpdated(new Date());
      } catch (err) {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // TWEAK 1: Update "last updated" text every minute
  useEffect(() => {
    if (!lastUpdated) return;
    
    // Initial update
    setLastUpdatedText(formatLastUpdated(lastUpdated));
    
    // Update every 30 seconds
    const interval = setInterval(() => {
      setLastUpdatedText(formatLastUpdated(lastUpdated));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [lastUpdated]);

  if (loading) {
    return (
      <PageTransition>
        <LoadingSkeleton.Stats count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <LoadingSkeleton.Card />
          <LoadingSkeleton.Card />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-lg font-semibold text-dark-900 mb-1">Error Loading Dashboard</h3>
            <p className="text-dark-500">{error}</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  const statCards = [
    {
      title: 'Total Members',
      value: stats.total_members,
      icon: Users,
      gradient: 'from-primary-600 to-indigo-700',
      trend: 'up',
      trendValue: '12%',
    },
    {
      title: 'Active Members',
      value: stats.active_members,
      icon: UserCheck,
      gradient: 'from-emerald-500 to-teal-600',
      trend: 'up',
      trendValue: '8%',
    },
    {
      title: 'Expired Members',
      value: stats.expired_members,
      icon: UserX,
      gradient: 'from-rose-500 to-pink-600',
      trend: 'down',
      trendValue: '3%',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiring_soon,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      // TWEAK 2: Enable pulse animation when expiring_soon > 0
      pulse: stats.expiring_soon > 0,
    },
  ];

  return (
    <PageTransition>
      {/* TWEAK 1: Last Updated Indicator */}
      {lastUpdatedText && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-dark-400 mb-4"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Last updated: {lastUpdatedText}</span>
        </motion.div>
      )}

      {/* Stats Grid - Responsive: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        {statCards.map((stat, index) => (
          <Card.Stat
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
            trend={stat.trend}
            trendValue={stat.trendValue}
            delay={index * 0.1}
            pulse={stat.pulse}  // TWEAK 2: Pass pulse prop for Expiring Soon highlight
          />
        ))}
      </div>

      {/* Quick Stats Cards - Stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Membership Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark-900">Membership Overview</h3>
            <div className="p-2 bg-primary-100 rounded-lg">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base text-dark-600">Active Rate</span>
              <span className="font-semibold text-dark-900">
                {stats.total_members > 0 
                  ? Math.round((stats.active_members / stats.total_members) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-dark-100 rounded-full h-2.5 sm:h-3">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 sm:h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${stats.total_members > 0 
                    ? (stats.active_members / stats.total_members) * 100 
                    : 0}%` 
                }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-dark-100">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.active_members}</p>
                <p className="text-xs text-dark-500">Active</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.expiring_soon}</p>
                <p className="text-xs text-dark-500">Expiring</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-rose-600">{stats.expired_members}</p>
                <p className="text-xs text-dark-500">Expired</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-card p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-dark-900">Quick Insights</h3>
            <div className="p-2 bg-primary-100 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl border border-primary-100">
              <div className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-primary-100 rounded-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-dark-600">Total Members</p>
                  <p className="text-lg sm:text-xl font-bold text-dark-900">{stats.total_members}</p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-dark-600">Expiring in 7 Days</p>
                  <p className="text-lg sm:text-xl font-bold text-dark-900">{stats.expiring_soon}</p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
              <div className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-rose-100 rounded-lg">
                  <UserX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-dark-600">Need Renewal</p>
                  <p className="text-lg sm:text-xl font-bold text-dark-900">{stats.expired_members}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

export default Dashboard;
