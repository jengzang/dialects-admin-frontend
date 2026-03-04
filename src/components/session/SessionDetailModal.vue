<template>
  <BaseModal
    v-model="visible"
    title="會話詳情"
    width="900px"
    :show-default-footer="false"
  >
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>加載中...</span>
    </div>

    <div v-else-if="sessionDetail" class="detail-content">
      <!-- Tabs -->
      <div class="detail-tabs">
        <button
          class="tab-button"
          :class="{ active: activeTab === 'info' }"
          @click="activeTab = 'info'"
        >
          基礎信息
        </button>
        <button
          class="tab-button"
          :class="{ active: activeTab === 'activity' }"
          @click="activeTab = 'activity'"
        >
          活動時間線
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- 基础信息标签页 -->
        <div v-show="activeTab === 'info'" class="tab-pane">
          <!-- 会话信息 -->
          <div class="detail-section">
            <h3>會話信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">會話 ID</span>
                <span class="info-value monospace">{{ sessionDetail.session_id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">用戶名</span>
                <span class="info-value">
                  <span class="tag tag-primary">{{ sessionDetail.username }}</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">創建時間</span>
                <span class="info-value">{{ formatDateTime(sessionDetail.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">過期時間</span>
                <span class="info-value" :class="{ 'text-danger': isExpired(sessionDetail.expires_at) }">
                  {{ formatDateTime(sessionDetail.expires_at) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">最後活動</span>
                <span class="info-value">{{ formatDateTime(sessionDetail.last_activity_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最後請求</span>
                <span class="info-value">{{ formatDateTime(sessionDetail.last_seen) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">刷新次數</span>
                <span class="info-value">{{ sessionDetail.refresh_count || 0 }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">在線時長</span>
                <span class="info-value">{{ formatOnlineTime(sessionDetail.total_online_seconds) }}</span>
              </div>
            </div>
          </div>

          <!-- 网络信息 -->
          <div class="detail-section">
            <h3>網絡信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">首次 IP</span>
                <span class="info-value">
                  <IPLocationDisplay
                    v-if="sessionDetail.first_ip"
                    :ip="sessionDetail.first_ip"
                    :location="sessionDetail.first_ip_location"
                  />
                  <span v-else>N/A</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">當前 IP</span>
                <span class="info-value">
                  <IPLocationDisplay
                    v-if="sessionDetail.current_ip"
                    :ip="sessionDetail.current_ip"
                    :location="sessionDetail.current_ip_location"
                  />
                  <span v-else>N/A</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">IP 變更次數</span>
                <span class="info-value">
                  <span class="tag" :class="sessionDetail.ip_change_count > 3 ? 'tag-warning' : 'tag-info'">
                    {{ sessionDetail.ip_change_count || 0 }}
                  </span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">設備變更次數</span>
                <span class="info-value">
                  <span class="tag" :class="sessionDetail.device_change_count > 2 ? 'tag-warning' : 'tag-info'">
                    {{ sessionDetail.device_change_count || 0 }}
                  </span>
                </span>
              </div>
            </div>

            <!-- IP 变化历史 -->
            <div v-if="ipHistory.length > 0" class="ip-history">
              <h4>IP 變化歷史</h4>
              <div class="timeline">
                <div
                  v-for="(item, index) in ipHistory"
                  :key="index"
                  class="timeline-item"
                >
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-time">{{ formatDateTime(item.timestamp) }}</div>
                    <div class="timeline-text">
                      <IPLocationDisplay
                        :ip="item.ip"
                        :location="item.location"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 设备信息 -->
          <div class="detail-section">
            <h3>設備信息</h3>
            <div class="info-grid">
              <div class="info-item full-width">
                <span class="info-label">首次設備</span>
                <span class="info-value">{{ sessionDetail.first_device_info || 'N/A' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">當前設備</span>
                <span class="info-value">{{ sessionDetail.device_info || 'N/A' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="info-label">設備指紋</span>
                <span class="info-value monospace">{{ sessionDetail.device_fingerprint || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- 安全信息 -->
          <div v-if="sessionDetail.is_suspicious || sessionDetail.revoked" class="detail-section">
            <h3>安全信息</h3>
            <div
              v-if="sessionDetail.is_suspicious"
              class="alert alert-warning"
            >
              <strong>可疑會話</strong>
              <p v-if="sessionDetail.suspicious_reason">{{ sessionDetail.suspicious_reason }}</p>
            </div>
            <div
              v-if="sessionDetail.revoked"
              class="alert alert-danger"
            >
              <strong>已撤銷</strong>
              <p v-if="sessionDetail.revoked_reason">{{ sessionDetail.revoked_reason }}</p>
              <p v-if="sessionDetail.revoked_at" class="alert-time">
                撤銷時間: {{ formatDateTime(sessionDetail.revoked_at) }}
              </p>
            </div>
          </div>
        </div>

        <!-- 活动时间线标签页 -->
        <div v-show="activeTab === 'activity'" class="tab-pane">
          <div v-if="activityLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <span>加載活動記錄...</span>
          </div>
          <div v-else-if="activity && activity.events && activity.events.length > 0">
            <div class="timeline">
              <div
                v-for="(event, index) in activity.events"
                :key="index"
                class="timeline-item"
              >
                <div class="timeline-dot" :class="`timeline-dot--${getEventType(event.event_type)}`"></div>
                <div class="timeline-content">
                  <div class="timeline-time">{{ formatDateTime(event.timestamp) }}</div>
                  <div class="timeline-header">
                    <span class="tag" :class="`tag-${getEventType(event.event_type)}`">
                      {{ getEventTitle(event.event_type) }}
                    </span>
                  </div>
                  <p v-if="event.details" class="timeline-text">{{ event.details }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>暫無活動記錄</p>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="handleClose">關閉</button>
        <button
          v-if="sessionDetail && !sessionDetail.revoked"
          class="btn btn-danger"
          @click="handleRevoke"
        >
          撤銷會話
        </button>
        <button
          v-if="sessionDetail && !sessionDetail.is_suspicious"
          class="btn btn-warning"
          @click="handleFlag(true)"
        >
          標記可疑
        </button>
        <button
          v-if="sessionDetail && sessionDetail.is_suspicious"
          class="btn btn-success"
          @click="handleFlag(false)"
        >
          取消標記
        </button>
      </div>
    </div>
  </BaseModal>

  <!-- 标记可疑对话框 -->
  <BaseModal
    v-model="flagDialogVisible"
    title="標記可疑會話"
    width="500px"
    @confirm="confirmFlag"
  >
    <div class="flag-form">
      <div class="form-group">
        <label class="form-label">可疑原因</label>
        <select v-model="flagForm.reason" class="form-select">
          <option value="">請選擇原因</option>
          <option value="rapid_ip_change">快速換 IP</option>
          <option value="unusual_location">異常地點</option>
          <option value="device_mismatch">設備不匹配</option>
          <option value="unusual_activity">異常活動模式</option>
          <option value="other">其他</option>
        </select>
      </div>
      <div v-if="flagForm.reason === 'other'" class="form-group">
        <label class="form-label">詳細說明</label>
        <textarea
          v-model="flagForm.customReason"
          class="form-textarea"
          rows="3"
          placeholder="請輸入詳細說明"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-secondary" @click="flagDialogVisible = false">取消</button>
      <button class="btn btn-primary" @click="confirmFlag">確認</button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { BaseModal, IPLocationDisplay } from '@/components/common';
import userSessionAPI from '@/api/userSession';
import { ElMessage, ElMessageBox } from 'element-plus';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  sessionId: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'refresh']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const activityLoading = ref(false);
const sessionDetail = ref(null);
const activity = ref(null);
const activeTab = ref('info');
const flagDialogVisible = ref(false);
const flagForm = ref({
  reason: '',
  customReason: ''
});

// IP 历史记录
const ipHistory = computed(() => {
  if (!sessionDetail.value || !sessionDetail.value.ip_history) {
    return [];
  }
  try {
    const history = typeof sessionDetail.value.ip_history === 'string'
      ? JSON.parse(sessionDetail.value.ip_history)
      : sessionDetail.value.ip_history;
    return Array.isArray(history) ? history : [];
  } catch (e) {
    console.error('Failed to parse ip_history:', e);
    return [];
  }
});

// 事件类型映射
const eventTypeMap = {
  'created': { title: '會話創建', type: 'success' },
  'refreshed': { title: 'Token 刷新', type: 'primary' },
  'ip_changed': { title: 'IP 變更', type: 'warning' },
  'device_changed': { title: '設備變更', type: 'warning' },
  'flagged_suspicious': { title: '標記可疑', type: 'danger' },
  'revoked': { title: '會話撤銷', type: 'info' }
};

const getEventType = (eventType) => {
  return eventTypeMap[eventType]?.type || 'info';
};

const getEventTitle = (eventType) => {
  return eventTypeMap[eventType]?.title || eventType;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('zh-CN');
};

const formatOnlineTime = (seconds) => {
  if (!seconds) return '0 分鐘';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} 小時 ${minutes} 分鐘`;
  }
  return `${minutes} 分鐘`;
};

const isExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

const loadSessionDetail = async () => {
  if (!props.sessionId) return;

  loading.value = true;
  try {
    sessionDetail.value = await userSessionAPI.getSessionDetail(props.sessionId);
  } catch (error) {
    console.error('Failed to load session detail:', error);
    ElMessage.error('加載會話詳情失敗');
  } finally {
    loading.value = false;
  }
};

const loadActivity = async () => {
  if (!props.sessionId) return;

  activityLoading.value = true;
  try {
    activity.value = await userSessionAPI.getSessionActivity(props.sessionId);
  } catch (error) {
    console.error('Failed to load activity:', error);
    ElMessage.error('加載活動記錄失敗');
  } finally {
    activityLoading.value = false;
  }
};

const handleClose = () => {
  visible.value = false;
  activeTab.value = 'info';
  sessionDetail.value = null;
  activity.value = null;
};

const handleRevoke = async () => {
  try {
    await ElMessageBox.confirm('確定要撤銷此會話嗎？', '確認', {
      type: 'warning',
      confirmButtonText: '確定',
      cancelButtonText: '取消'
    });

    await userSessionAPI.revokeSession(props.sessionId, 'admin_action');
    ElMessage.success('會話已撤銷');
    emit('refresh');
    handleClose();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to revoke session:', error);
      ElMessage.error('撤銷會話失敗');
    }
  }
};

const handleFlag = (isSuspicious) => {
  if (isSuspicious) {
    flagDialogVisible.value = true;
  } else {
    confirmFlag(false);
  }
};

const confirmFlag = async (needsReason = true) => {
  try {
    let reason = '';
    if (needsReason) {
      if (!flagForm.value.reason) {
        ElMessage.warning('請選擇可疑原因');
        return;
      }
      reason = flagForm.value.reason === 'other'
        ? flagForm.value.customReason
        : flagForm.value.reason;
    }

    await userSessionAPI.flagSession(
      props.sessionId,
      needsReason,
      reason
    );

    ElMessage.success(needsReason ? '已標記為可疑會話' : '已取消可疑標記');
    flagDialogVisible.value = false;
    flagForm.value = { reason: '', customReason: '' };
    emit('refresh');
    await loadSessionDetail();
  } catch (error) {
    console.error('Failed to flag session:', error);
    ElMessage.error('操作失敗');
  }
};

// 监听 sessionId 变化
watch(() => props.sessionId, (newId) => {
  if (newId && visible.value) {
    loadSessionDetail();
  }
}, { immediate: true });

// 监听对话框打开
watch(visible, (newVal) => {
  if (newVal && props.sessionId) {
    loadSessionDetail();
  }
});

// 监听标签页切换
watch(activeTab, (newTab) => {
  if (newTab === 'activity' && !activity.value && props.sessionId) {
    loadActivity();
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/abstracts/variables';
@import '@/styles/abstracts/mixins';

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid $color-border-light;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  span {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.detail-content {
  min-height: 400px;
}

// Tabs
.detail-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid $color-border-light;
  margin-bottom: $spacing-lg;
}

.tab-button {
  padding: $spacing-sm $spacing-md;
  border: none;
  background: transparent;
  color: $color-text-secondary;
  font-size: $font-size-md;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all $transition-fast;

  &:hover {
    color: $color-primary;
  }

  &.active {
    color: $color-primary;
    border-bottom-color: $color-primary;
  }
}

.tab-content {
  min-height: 300px;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

// Detail sections
.detail-section {
  margin-bottom: $spacing-lg;

  h3 {
    margin: 0 0 $spacing-md 0;
    font-size: $font-size-lg;
    font-weight: 600;
    color: $color-text-primary;
  }

  h4 {
    margin: $spacing-md 0 $spacing-sm 0;
    font-size: $font-size-md;
    font-weight: 500;
    color: $color-text-secondary;
  }
}

// Info grid
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.info-label {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  font-weight: 500;
}

.info-value {
  font-size: $font-size-md;
  color: $color-text-primary;
}

.monospace {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.text-danger {
  color: $color-danger;
}

// Tags
.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: $radius-sm;
  font-size: $font-size-xs;
  font-weight: 500;
}

.tag-primary {
  background: $color-primary-lighter;
  color: $color-primary-dark;
}

.tag-info {
  background: #e3f2fd;
  color: #1976d2;
}

.tag-warning {
  background: #fff3e0;
  color: #f57c00;
}

.tag-danger {
  background: #ffebee;
  color: #c62828;
}

.tag-success {
  background: $color-primary-lighter;
  color: $color-primary-dark;
}

// Timeline
.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline-item {
  position: relative;
  padding-bottom: $spacing-md;

  &:last-child {
    padding-bottom: 0;
  }

  &::before {
    content: '';
    position: absolute;
    left: -24px;
    top: 8px;
    bottom: -8px;
    width: 2px;
    background: $color-border-light;
  }

  &:last-child::before {
    display: none;
  }
}

.timeline-dot {
  position: absolute;
  left: -30px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $color-border;
  border: 2px solid $color-background-white;

  &.timeline-dot--success {
    background: $color-success;
  }

  &.timeline-dot--primary {
    background: $color-info;
  }

  &.timeline-dot--warning {
    background: $color-warning;
  }

  &.timeline-dot--danger {
    background: $color-danger;
  }

  &.timeline-dot--info {
    background: $color-text-light;
  }
}

.timeline-content {
  padding-left: $spacing-sm;
}

.timeline-time {
  font-size: $font-size-xs;
  color: $color-text-light;
  margin-bottom: 4px;
}

.timeline-header {
  margin-bottom: 4px;
}

.timeline-text {
  margin: 0;
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

// IP History
.ip-history {
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: $color-background-light;
  border-radius: $radius-md;
}

// Alerts
.alert {
  padding: $spacing-md;
  border-radius: $radius-md;
  margin-bottom: $spacing-sm;

  strong {
    display: block;
    margin-bottom: 4px;
    font-size: $font-size-md;
  }

  p {
    margin: 0;
    font-size: $font-size-sm;
  }

  .alert-time {
    margin-top: 4px;
    font-size: $font-size-xs;
    opacity: 0.8;
  }
}

.alert-warning {
  background: #fff3e0;
  color: #f57c00;
  border-left: 4px solid $color-warning;
}

.alert-danger {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid $color-danger;
}

// Empty state
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: $color-text-light;
}

// Modal actions
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding-top: $spacing-md;
  border-top: 1px solid $color-border-light;
  margin-top: $spacing-lg;
  flex-wrap: wrap;
}

// Flag form
.flag-form {
  .form-group {
    margin-bottom: $spacing-md;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-label {
    display: block;
    margin-bottom: $spacing-xs;
    font-size: $font-size-sm;
    font-weight: 500;
    color: $color-text-primary;
  }

  .form-select,
  .form-textarea {
    width: 100%;
    padding: $spacing-sm;
    border: 1px solid $color-border-light;
    border-radius: $radius-sm;
    font-size: $font-size-sm;
    transition: border-color $transition-fast;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  .form-textarea {
    resize: vertical;
    font-family: inherit;
  }
}

// Mobile responsive
@include respond-to(tablet) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    .btn {
      flex: 1;
      min-width: calc(50% - 4px); // 一行最多2个按钮
    }
  }

  .detail-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-button {
    white-space: nowrap;
  }
}

@include respond-to(mobile) {
  .timeline {
    padding-left: 20px;
  }

  .timeline-item::before {
    left: -14px;
  }

  .timeline-dot {
    left: -20px;
    width: 10px;
    height: 10px;
  }
}
</style>
