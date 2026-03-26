// ===================================
// 1. import
// ===================================
import React, { useState } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, TextField,
    InputAdornment
} from '@mui/material'
import {Search, Add} from '@mui/icons-material'

// ===================================
// 2. 타입정의
// ===================================
interface Post {
    id: number;
    title: string;
    author: string;
    date: string;
    views: number;
    contenct: string;
}

// 더미
const dummyPosts: Post[] = [
    {id: 1, title:'타이틀1', author:'홍길동', date:'20260101', views:1, contenct:'내용111'},
    {id: 2, title:'타이틀2', author:'홍길동', date:'20260202', views:2, contenct:'내용222'}
];

// ===================================
// 3. 컴포넌트 선언
// ===================================
const BoardPage: React.FC = () => {
    
    const [searchQuery, setSearchQuery] = useState('');         // 검색어
    const [rowData, setRowData] = useState<Post | null>(null);  // 그리드 Row
    const [isOpenPopup, setIsOpenPopup] = useState(false);      // 팝업 Open
    const [posts] = useState<Post[]>(dummyPosts);   

    // 필터링
    const filteredPosts = posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // 그리드 Row 클릭
    const onClickGridRow = (post: Post) => {
        setRowData(post);
        setIsOpenPopup(true);
    }
    

    // TODO: 이벤트 핸들러
    // 글쓰기버튼 클릭

    // 화면 렌더링
    return (
        <Box>
            {/* 헤더영역 */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                <Typography variant="h5" fontWeight={700}>게시판</Typography>
                <Button variant="contained" startIcon={<Add />}>글쓰기</Button>
            </Box>

            {/* 검색영역 */}
            <TextField
                size="small"
                fullWidth
                placeholder="제목을 입력하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{mb:2}}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    )
                }}
                />

            {/* 목록영역 */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width={70}>번호</TableCell>
                            <TableCell>제목</TableCell>
                            <TableCell width={140}>작성자</TableCell>
                            <TableCell width={160}>작성일</TableCell>
                            <TableCell width={80}>조회수</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredPosts.map((post) => (
                            <TableRow
                                key={post.id}
                                hover
                                sx={{cursor:'pointer'}}
                                onClick={()=>onClickGridRow(post)}
                                >
                                <TableCell>{post.id}</TableCell>
                                <TableCell>{post.title}</TableCell>
                                <TableCell>{post.author}</TableCell>
                                <TableCell>{post.date}</TableCell>
                                <TableCell>{post.views}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    );

}

export default BoardPage;


// ===================================
// 
// ===================================

/*
const BoardPage: React.FC = () => {

  // --- 화면 렌더링 ---
  return (
    <Box>
      {/* 테이블 영역 }
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow
                key={post.id}
                hover
                sx={{ cursor: 'pointer' }}
                // TODO: onClick → handleRowClick(post)
              >
                <TableCell>{post.id}</TableCell>
                <TableCell>{post.title}</TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>{post.date}</TableCell>
                <TableCell>{post.views}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* TODO: <BoardDialog /> 추가 }
    </Box>
  );
};

export default BoardPage;
*/