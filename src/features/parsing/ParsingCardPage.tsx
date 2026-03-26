/**
 * 📄 파싱(업로드) 페이지 - 카드 버전 - 견적서 처리 1단계
 * 
 * 🎯 주요 기능:
 * 1. 드래그앤드롭 파일 업로드 (Excel 파일)
 * 2. AI 자동 파싱 진행률 실시간 표시
 * 3. 파일별 상태 관리 (대기/추출중/검증/분석/실패)
 * 4. 파일 목록을 카드 형태로 표시 (그리드 레이아웃)
 * 5. 개별 파일 카드에 상세 정보 및 액션 버튼
 * 
 * 📊 카드 기반 레이아웃:
 * - 그리드: 반응형 카드 레이아웃 (데스크톱 3열, 태블릿 2열, 모바일 1열)
 * - 카드: 파일별 독립된 카드 컴포넌트
 * - 상태: 카드 헤더 색상으로 상태 구분
 * - 액션: 카드 하단에 상태별 액션 버튼
 * 
 * 🎨 카드 디자인:
 * - 헤더: 파일명 + 상태 배지
 * - 바디: 파일 정보 (크기, 업로드 시간, 진행률)
 * - 푸터: 액션 버튼 (검증하기, 분석하기, 재시도 등)
 * 
 * 🔗 기존 테이블 버전과 동일한 기능:
 * - 상태 필터링, 검색, 정렬 모든 기능 지원
 * - 동일한 useParsingPage 훅 사용
 * - 동일한 라우팅 및 상태 관리
 */
import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Button,
  Card,
  Chip,
  Grid,
  LinearProgress
} from '@mui/material';
import { 
  Search, 
  FilterList,
  CheckCircle,
  Schedule,
  Error,
  Analytics
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { C } from '../../shared/constants/colors';
import FileUploadArea from './components/FileUploadArea';
import FileDetailDrawer from './components/FileDetailDrawer';
import SearchFilterDialog from './components/SearchFilterDialog';
import { useParsingPage } from './hooks/useParsingPage';

// 📋 파일 카드 컴포넌트
const FileCard: React.FC<{
  file: any;
  onVerify: () => void;
  onAnalysis: () => void;
  onDetail: () => void;
  onRetry?: () => void;
  onClick: () => void;
}> = ({ file, onVerify, onAnalysis, onDetail, onRetry, onClick }) => {

  // 상태별 색상 및 아이콘
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'extracting':
        return { 
          color: '#ff9800', 
          icon: <Schedule sx={{ fontSize: 16 }} />, 
          label: '추출중', 
          bgColor: '#fff3e0' 
        };
      case 'complete':
        return { 
          color: '#4caf50', 
          icon: <CheckCircle sx={{ fontSize: 16 }} />, 
          label: '완료', 
          bgColor: '#e8f5e8' 
        };
      case 'analyzing':
        return { 
          color: '#9c27b0', 
          icon: <Analytics sx={{ fontSize: 16 }} />, 
          label: '분석중', 
          bgColor: '#f3e5f5' 
        };
      case 'failed':
        return { 
          color: '#f44336', 
          icon: <Error sx={{ fontSize: 16 }} />, 
          label: '실패', 
          bgColor: '#ffebee' 
        };
      default:
        return { 
          color: '#9e9e9e', 
          icon: <Schedule sx={{ fontSize: 16 }} />, 
          label: '대기', 
          bgColor: '#f5f5f5' 
        };
    }
  };

  const statusConfig = getStatusConfig(file.status);
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card 
      sx={{ 
        minHeight: '320px', // 추가 정보로 인한 높이 증가
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        border: '1px solid #f2f4f6',
        borderRadius: '16px',
        cursor: 'pointer',
        bgcolor: 'white',
        boxShadow: 'none',
        overflow: 'hidden',
        '&:hover': { 
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          borderColor: '#0064ff'
        }
      }}
      onClick={onClick}
    >
      {/* 🎨 Toss 스타일 카드 헤더 */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          {/* 상태 배지, 파일명 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                backgroundColor: `${statusConfig.color}15`,
                color: statusConfig.color,
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: `1px solid ${statusConfig.color}30`
              }}
            >
              {statusConfig.label}
            </Box>
            <Typography 
              sx={{ 
                fontSize: 16, 
                fontWeight: 700, 
                color: '#191f28',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                letterSpacing: '-0.3px'
              }}
              title={file.name}
            >
              {file.name}
            </Typography>
          </Box>
        </Box>

        {/* 📋 Toss 스타일 파일 정보 */}
        <Box sx={{ mb: 2 }}>
          {/* 첫 번째 라인: 파일 크기, 업로드일 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
            <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
              📁 {formatFileSize(file.size || 0)}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
              📅 {file.uploadDate || file.uploadedAt}
            </Typography>
          </Box>
          
          {/* 두 번째 라인: 업로더, 부서 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
            <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
              👤 {file.uploader}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
              🏢 {file.department}
            </Typography>
          </Box>

          {/* 세 번째 라인: 파싱항목, 이상치 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography sx={{ 
              fontSize: 14, 
              color: file.parsedItems != null ? '#4e5968' : '#8b95a1', 
              fontWeight: file.parsedItems != null ? 600 : 500 
            }}>
              📊 파싱: {file.parsedItems != null ? `${file.parsedItems}건` : '—'}
            </Typography>
            <Typography sx={{ 
              fontSize: 14, 
              color: file.anomalies ? '#dc2626' : '#8b95a1', 
              fontWeight: file.anomalies ? 600 : 500 
            }}>
              ⚠️ 이상치: {file.anomalies != null ? `${file.anomalies}건` : '—'}
            </Typography>
          </Box>
        </Box>

        {/* 🔄 동적 콘텐츠 영역 - 유연한 높이 */}
        <Box sx={{ mb: 2, flex: 1 }}>
          {/* ⚡ Toss 스타일 진행률 */}
          {file.status === 'extracting' && (
            <Box sx={{ p: 2.5, bgcolor: '#f9fafb', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontSize: 14, color: '#4e5968', fontWeight: 600 }}>
                  처리 중
                </Typography>
                <Typography sx={{ fontSize: 14, color: statusConfig.color, fontWeight: 700 }}>
                  {file.progress || 0}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={file.progress || 0} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: '#e5e8eb',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: statusConfig.color,
                    borderRadius: 4
                  }
                }} 
              />
            </Box>
          )}

          {/* ⚠️ Toss 스타일 오류 메시지 */}
          {file.status === 'failed' && file.error && (
            <Box sx={{ 
              p: 2.5, 
              bgcolor: '#fff5f5', 
              borderRadius: '12px',
              border: '1px solid #fee2e2'
            }}>
              <Typography sx={{ fontSize: 14, color: '#dc2626', fontWeight: 600 }}>
                {file.error}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* 🎯 Toss 스타일 버튼 영역 */}
      <Box sx={{ 
        p: 3, 
        pt: 0, 
        mt: 'auto'
      }}>
        {file.status === 'complete' && (
          <Button 
            variant="contained" 
            fullWidth
            onClick={(e) => { e.stopPropagation(); onVerify(); }}
            sx={{ 
              fontSize: 16, 
              fontWeight: 700,
              textTransform: 'none', 
              bgcolor: '#0064ff', 
              borderRadius: '12px', 
              py: 1.5,
              boxShadow: 'none',
              letterSpacing: '-0.3px',
              '&:hover': { 
                bgcolor: '#0056d3',
                boxShadow: 'none'
              } 
            }}
          >
            검증하기
          </Button>
        )}
        
        {file.status === 'extracting' && (
          <Button 
            variant="outlined" 
            fullWidth
            disabled 
            sx={{ 
              fontSize: 16, 
              fontWeight: 700,
              textTransform: 'none', 
              borderRadius: '12px',
              py: 1.5,
              borderColor: '#f2f4f6',
              color: '#8b95a1',
              letterSpacing: '-0.3px'
            }}
          >
            처리중
          </Button>
        )}
        
        {file.status === 'failed' && (
          <Button 
            variant="contained" 
            fullWidth
            onClick={(e) => { e.stopPropagation(); onDetail(); }}
            sx={{ 
              fontSize: 16, 
              fontWeight: 700,
              textTransform: 'none', 
              borderRadius: '12px',
              py: 1.5,
              bgcolor: '#ff5a5a',
              boxShadow: 'none',
              letterSpacing: '-0.3px',
              '&:hover': { 
                bgcolor: '#ff4444',
                boxShadow: 'none'
              }
            }}
          >
            오류 확인
          </Button>
        )}
        
        {file.status === 'analyzing' && (
          <Button 
            variant="contained" 
            fullWidth
            onClick={(e) => { e.stopPropagation(); onAnalysis(); }}
            sx={{ 
              fontSize: 16, 
              fontWeight: 700,
              textTransform: 'none', 
              bgcolor: '#00c896', 
              borderRadius: '12px',
              py: 1.5,
              boxShadow: 'none',
              letterSpacing: '-0.3px',
              '&:hover': { 
                bgcolor: '#00b085',
                boxShadow: 'none'
              }
            }}
          >
            상세보기
          </Button>
        )}
      </Box>
    </Card>
  );
};

const ParsingCardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    filter, setFilter,
    searchQuery, setSearchQuery,
    dragOver, setDragOver,
    uploadQueue, setUploadQueue,
    drawerFile, setDrawerFile,
    searchDialogOpen, setSearchDialogOpen,
    searchFilters, setSearchFilters,
    filteredAndSorted, counts, isSearchActive, statusCards,
    handleFiles,
  } = useParsingPage();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* 🎨 Toss 스타일 헤더 */}
      <Box sx={{ 
        bgcolor: 'white',
        px: 4, 
        py: 4,
        borderBottom: '1px solid #f2f4f6'
      }}>
        <Typography sx={{ 
          fontSize: 28, 
          fontWeight: 800, 
          color: '#191f28',
          mb: 0.5,
          letterSpacing: '-0.5px'
        }}>
          견적서 파싱
        </Typography>
        <Typography sx={{ 
          fontSize: 16, 
          color: '#8b95a1',
          fontWeight: 400,
          lineHeight: 1.5
        }}>
          파일을 업로드하면 AI가 자동으로 데이터를 추출해요
        </Typography>
      </Box>

      {/* 🔄 Toss 스타일 업로드 영역 */}
      <Box sx={{ px: 4, pt: 2, pb: 3 }}>
        <FileUploadArea
          dragOver={dragOver} 
          uploadQueue={uploadQueue}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { 
            e.preventDefault(); 
            setDragOver(false); 
            if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); 
          }}
          onFileSelect={handleFiles}
          onRemoveQueue={i => setUploadQueue(prev => prev.filter((_, j) => j !== i))}
        />
      </Box>

      {/* 🔍 Toss 스타일 검색 */}
      <Box sx={{ px: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField 
            fullWidth 
            placeholder="파일명 검색" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{ 
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: '#8b95a1' }} />
                </InputAdornment>
              ), 
              sx: { 
                fontSize: 16, 
                borderRadius: '12px',
                bgcolor: 'white',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#f2f4f6' },
                  '&:hover fieldset': { borderColor: '#0064ff' },
                  '&.Mui-focused fieldset': { borderColor: '#0064ff', borderWidth: 2 }
                }
              } 
            }} 
          />
          <Button 
            variant={isSearchActive ? 'contained' : 'outlined'}
            onClick={() => setSearchDialogOpen(true)}
            sx={{ 
              px: 3,
              py: 1.5,
              fontSize: 15,
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              ...(isSearchActive ? {
                bgcolor: '#0064ff',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#0056d3' }
              } : {
                borderColor: '#f2f4f6',
                color: '#4e5968',
                bgcolor: 'white',
                '&:hover': { 
                  borderColor: '#0064ff',
                  bgcolor: 'white'
                }
              })
            }}
          >
            <FilterList sx={{ fontSize: 18, mr: 0.5 }} />
            필터
          </Button>
        </Box>
      </Box>

      {/* 📊 Toss 스타일 상태 카드 */}
      <Box sx={{ px: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {statusCards.map((sc, index) => (
            <Box 
              key={sc.key} 
              onClick={() => setFilter(sc.key)}
              sx={{ 
                flex: 1, 
                bgcolor: 'white',
                border: filter === sc.key ? `2px solid ${sc.colorKey}` : '1px solid #f2f4f6',
                borderRadius: '16px', 
                p: 3, 
                cursor: 'pointer', 
                textAlign: 'center', 
                transition: 'all 0.2s ease',
                '&:hover': { 
                  borderColor: sc.colorKey,
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Typography sx={{ 
                fontSize: 36, 
                fontWeight: 800, 
                color: sc.colorKey, 
                mb: 0.5,
                lineHeight: 1,
                letterSpacing: '-1px'
              }}>
                {counts[sc.key]}
              </Typography>
              <Typography sx={{ 
                fontSize: 14, 
                color: '#8b95a1',
                fontWeight: 500
              }}>
                {sc.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 📁 Toss 스타일 파일 그리드 */}
      <Box sx={{ px: 4, pb: 6 }}>
        {filteredAndSorted.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 12,
            bgcolor: 'white',
            borderRadius: '16px',
            border: '1px solid #f2f4f6'
          }}>
            <Typography sx={{ fontSize: 64, mb: 3 }}>📄</Typography>
            <Typography sx={{ 
              fontSize: 20, 
              color: '#191f28', 
              mb: 1,
              fontWeight: 700,
              letterSpacing: '-0.5px'
            }}>
              아직 업로드된 파일이 없어요
            </Typography>
            <Typography sx={{ 
              fontSize: 16, 
              color: '#8b95a1',
              fontWeight: 500,
              lineHeight: 1.6
            }}>
              Excel 파일을 드래그하거나 업로드 버튼을 눌러주세요
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredAndSorted.map(file => (
              <Grid item xs={12} sm={6} lg={4} key={file.id}>
                <FileCard
                  file={file}
                  onVerify={() => navigate('/verification')}
                  onAnalysis={() => navigate('/analysis')}
                  onDetail={() => setDrawerFile(file)}
                  onRetry={() => {
                    // 재시도 로직
                    console.log('Retrying file:', file.name);
                  }}
                  onClick={() => setDrawerFile(file)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* 상세 정보 드로어 */}
      <FileDetailDrawer
        file={drawerFile}
        onClose={() => setDrawerFile(null)}
        onVerify={() => navigate('/verification')}
      />

      {/* 검색 필터 다이얼로그 */}
      <SearchFilterDialog
        open={searchDialogOpen}
        filters={searchFilters}
        onChange={setSearchFilters}
        onApply={() => setSearchDialogOpen(false)}
        onReset={() => setSearchFilters({ 
          documentName: '', 
          dateFrom: '', 
          dateTo: '', 
          uploader: '', 
          department: '' 
        })}
        onClose={() => setSearchDialogOpen(false)}
      />
    </Box>
  );
};

export default ParsingCardPage;