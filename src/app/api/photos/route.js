import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Get all photos with user information
    const [photos] = await pool.query(`
      SELECT 
        p.id, p.url, p.title, p.likes, p.commentsCount, p.createdAt,
        u.id as userId, u.username, u.profileImage
      FROM Photo p
      JOIN User u ON p.userId = u.id
      ORDER BY p.createdAt DESC
    `);

    // Format the results
    const formattedPhotos = await Promise.all(photos.map(async (photo) => {
      let isLiked = false;
      
      // Check if the photo is liked by the user
      if (userId) {
        const [likes] = await pool.query(
          'SELECT * FROM `Like` WHERE photoId = ? AND userId = ?',
          [photo.id, parseInt(userId)]
        );
        isLiked = likes.length > 0;
      }

      return {
        id: photo.id,
        url: photo.url,
        title: photo.title,
        likes: photo.likes,
        commentsCount: photo.commentsCount,
        createdAt: photo.createdAt,
        user: {
          id: photo.userId,
          username: photo.username,
          profileImage: photo.profileImage
        },
        isLiked
      };
    }));

    return NextResponse.json(formattedPhotos)
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Error fetching photos' },
      { status: 500 }
    )
  }
} 