"use client";

import { useEffect, useState } from "react";
import { adminService, AdminShop } from "@/services/admin.service";
import toast, { Toaster } from "react-hot-toast";
import { 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Eye, 
  Search,
  User,
  Phone,
  Mail,
  Calendar
} from "lucide-react";

export default function AdminMerchantsPage() {
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<AdminShop | null>(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchShops = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getShops("pending");
      setShops(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm("Xác nhận phê duyệt shop này?")) return;
    try {
      setIsActionLoading(true);
      await adminService.approveShop(id);
      toast.success("Đã phê duyệt shop!");
      setShowKycModal(false);
      fetchShops();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi phê duyệt");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      setIsActionLoading(true);
      await adminService.rejectShop(id, rejectionReason);
      toast.success("Đã từ chối yêu cầu");
      setShowKycModal(false);
      setShowRejectInput(false);
      setRejectionReason("");
      fetchShops();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi từ chối");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-right" />
      
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Người bán</h1>
            <p className="text-gray-500">Phê duyệt hoặc từ chối các yêu cầu mở gian hàng mới</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-400 text-neutral-900 shadow-sm">
            <ShieldCheck size={28} />
          </div>
        </div>

        {/* Filters/Stats (Optional) */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="text-sm font-medium text-gray-500">Yêu cầu chờ duyệt</div>
            <div className="mt-2 text-3xl font-bold text-neutral-900">{shops.length}</div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-primary-400" size={40} />
              <p className="text-sm text-gray-500">Đang tải danh sách yêu cầu...</p>
            </div>
          ) : shops.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2">
              <div className="rounded-full bg-gray-100 p-4 text-gray-400">
                <Search size={32} />
              </div>
              <p className="font-medium text-gray-500">Không có yêu cầu nào đang chờ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-50 bg-gray-50/50 text-gray-600 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Thông tin Shop</th>
                    <th className="px-6 py-4">Chủ sở hữu</th>
                    <th className="px-6 py-4">Ngày gửi</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {shops.map((shop) => (
                    <tr key={shop._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{shop.shopName}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Phone size={12} /> {shop.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                            <User size={14} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{shop.owner.fullName}</div>
                            <div className="text-xs text-gray-500">{shop.owner.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(shop.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedShop(shop);
                            setShowKycModal(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-gray-800 active:scale-95 shadow-sm"
                        >
                          <Eye size={14} />
                          Xem KYC
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* KYC Modal */}
      {showKycModal && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Chi tiết Hồ sơ Định danh</h2>
                <p className="text-sm text-gray-500">{selectedShop.shopName} • {selectedShop.owner.fullName}</p>
              </div>
              <button 
                onClick={() => {
                  setShowKycModal(false);
                  setShowRejectInput(false);
                }}
                className="rounded-full p-2 hover:bg-gray-200 transition-colors"
              >
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-sm font-bold text-gray-700">Mặt trước CCCD</span>
                  <div className="group relative aspect-[1.6/1] overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <img 
                      src={selectedShop.kyc.idCardFront} 
                      alt="Front ID" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <a 
                      href={selectedShop.kyc.idCardFront} 
                      target="_blank" 
                      className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-bold text-gray-700">Mặt sau CCCD</span>
                  <div className="group relative aspect-[1.6/1] overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <img 
                      src={selectedShop.kyc.idCardBack} 
                      alt="Back ID" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <a 
                      href={selectedShop.kyc.idCardBack} 
                      target="_blank" 
                      className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/50 text-white backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              {showRejectInput && (
                <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-bold text-red-600">Lý do từ chối *</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-red-200 p-4 text-sm outline-none focus:ring-2 focus:ring-red-100"
                    placeholder="Ví dụ: Ảnh mờ, thông tin không khớp..."
                    rows={3}
                  />
                  <div className="mt-3 flex justify-end gap-2">
                    <button 
                      onClick={() => setShowRejectInput(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={() => handleReject(selectedShop._id)}
                      disabled={isActionLoading}
                      className="rounded-lg bg-red-600 px-6 py-2 text-sm font-bold text-white hover:bg-red-700 shadow-sm disabled:opacity-50"
                    >
                      Xác nhận Từ chối
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!showRejectInput && (
              <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-6">
                <button 
                  onClick={() => setShowRejectInput(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <XCircle size={18} />
                  Từ chối yêu cầu
                </button>
                <button 
                  onClick={() => handleApprove(selectedShop._id)}
                  disabled={isActionLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-400 px-10 py-3 text-sm font-bold text-neutral-900 shadow-lg shadow-primary-200 hover:bg-primary-500 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isActionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  Phê duyệt & Kích hoạt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
