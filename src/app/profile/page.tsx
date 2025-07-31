"use client";
import { useEffect, useState } from "react";
import HomepageHeader from "@/components/common/HomepageHeader";
import { FiUser, FiMail, FiHash, FiHome, FiPhone, FiFileText, FiShield } from "react-icons/fi";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-4">
          <div className="text-red-500 mb-4">
            <FiUser className="w-16 h-16 mx-auto mb-4" />
          </div>
          <div className="text-2xl font-bold mb-2 text-red-600">Data user tidak ditemukan</div>
          <div className="text-gray-600 mb-6">Silakan login ulang untuk mengakses profil Anda.</div>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  const koperasi = user.koperasi_detail || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <HomepageHeader showResponsesButton={false} showCreateFormButton={false} isAdminPage={false} />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <FiUser className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Profil Pengguna</h1>
            <p className="text-gray-600">Informasi detail akun dan koperasi Anda</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <FiUser className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Informasi Pribadi</h2>
              </div>
              <div className="space-y-4">
                <ProfileField 
                  label="Nama Lengkap" 
                  value={user.name} 
                  icon={<FiUser className="w-4 h-4" />}
                />
                <ProfileField 
                  label="NIK" 
                  value={user.username} 
                  icon={<FiHash className="w-4 h-4" />}
                />
                <ProfileField 
                  label="Email" 
                  value={user.email} 
                  icon={<FiMail className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Cooperative Information Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <FiHome className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-800">Informasi Koperasi</h2>
              </div>
              <div className="space-y-4">
                <ProfileField 
                  label="Nama Koperasi" 
                  value={koperasi.koperasi_name} 
                  icon={<FiHome className="w-4 h-4" />}
                />
                <ProfileField 
                  label="No. Badan Hukum" 
                  value={koperasi.bh_no} 
                  icon={<FiFileText className="w-4 h-4" />}
                />
                <ProfileField 
                  label="Kontak Pendaftar" 
                  value={koperasi.registrant_contact} 
                  icon={<FiPhone className="w-4 h-4" />}
                />
                <ProfileField 
                  label="Email Terdaftar" 
                  value={koperasi.registered_email} 
                  icon={<FiMail className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Additional Information Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center mb-6">
              <FiShield className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Informasi Tambahan</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <ProfileField 
                label="Bentuk Koperasi" 
                value={koperasi.cooperative_structure?.BentukKoperasi} 
                icon={<FiShield className="w-4 h-4" />}
              />
              <ProfileField 
                label="Status Akun" 
                value="Aktif" 
                icon={<FiShield className="w-4 h-4" />}
                valueClassName="text-green-600 font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-8">
            <button 
              onClick={() => window.history.back()}
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors mr-4"
            >
              Kembali
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ 
  label, 
  value, 
  icon, 
  valueClassName = "text-gray-700" 
}: { 
  label: string; 
  value: any; 
  icon?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      {icon && (
        <div className="text-gray-400 mt-1 flex-shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
        <div className={`bg-gray-50 rounded-lg px-4 py-3 select-none cursor-not-allowed border border-gray-200 ${valueClassName}`}>
          {value || <span className="italic text-gray-400">Tidak tersedia</span>}
        </div>
      </div>
    </div>
  );
} 