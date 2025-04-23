#!/bin/bash

# Base URLs
USERS_URL="http://localhost:8000/api/users"
POSTS_URL="http://localhost:8000/api/posts"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
}

make_request() {
    local method=$1
    local endpoint=$2
    local data=$3

    echo "Request: $method $endpoint"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi

    if [ "$method" = "GET" ] || [ "$method" = "DELETE" ]; then
        curl -s -X $method "$endpoint" | python3 -m json.tool
    else
        curl -s -X $method "$endpoint" -H "Content-Type: application/json" -d "$data" | python3 -m json.tool
    fi
    echo ""
}

test_get_all_users() {
    print_header "Testing GET all users"
    read -p "Limit (default 10): " limit
    read -p "Offset (default 0): " offset
    make_request "GET" "$USERS_URL?limit=${limit:-10}&offset=${offset:-0}"
}

test_get_user() {
    print_header "Testing GET user by ID"
    read -p "Enter user ID: " user_id
    make_request "GET" "$USERS_URL/$user_id"
}

test_create_user() {
    print_header "Testing POST create user"
    read -p "Enter first name: " firstName
    read -p "Enter last name: " lastName
    read -p "Enter email: " email

    local user_data=$(cat <<EOF
{
    "firstName": "$firstName",
    "lastName": "$lastName",
    "email": "$email"
}
EOF
)
    make_request "POST" "$USERS_URL" "$user_data"
}

test_update_user() {
    print_header "Testing PUT update user"
    read -p "Enter user ID to update: " user_id
    read -p "Enter new first name (press Enter to keep current): " firstName
    read -p "Enter new last name (press Enter to keep current): " lastName
    read -p "Enter new email (press Enter to keep current): " email

    local update_data="{"
    local has_data=false

    if [ -n "$firstName" ]; then
        update_data+="\"firstName\": \"$firstName\""
        has_data=true
    fi
    if [ -n "$lastName" ]; then
        [ "$has_data" = true ] && update_data+=","
        update_data+="\"lastName\": \"$lastName\""
        has_data=true
    fi
    if [ -n "$email" ]; then
        [ "$has_data" = true ] && update_data+=","
        update_data+="\"email\": \"$email\""
        has_data=true
    fi
    update_data+="}"

    make_request "PUT" "$USERS_URL/$user_id" "$update_data"
}

test_delete_user() {
    print_header "Testing DELETE user"
    read -p "Enter user ID to delete: " user_id
    make_request "DELETE" "$USERS_URL/$user_id"
}

test_follow_user() {
    print_header "Testing FOLLOW user"
    read -p "Enter follower user ID: " user_id
    read -p "Enter user ID to follow: " follow_id

    local data=$(cat <<EOF
{
    "userToFollowId": $follow_id
}
EOF
)
    make_request "POST" "$USERS_URL/$user_id/follow" "$data"
}

test_unfollow_user() {
    print_header "Testing UNFOLLOW user"
    read -p "Enter follower user ID: " user_id
    read -p "Enter user ID to unfollow: " unfollow_id

    local data=$(cat <<EOF
{
    "userToUnfollowId": $unfollow_id
}
EOF
)
    make_request "POST" "$USERS_URL/$user_id/unfollow" "$data"
}

test_get_followers() {
    print_header "Testing GET followers of user"
    read -p "Enter user ID: " user_id
    read -p "Limit (default 10): " limit
    read -p "Offset (default 0): " offset
    make_request "GET" "$USERS_URL/$user_id/followers?limit=${limit:-10}&offset=${offset:-0}"
}

test_get_user_activity() {
    print_header "Testing GET user activity"
    read -p "Enter user ID: " user_id
    read -p "Filter by type (post, like, follow, or leave blank): " type
    read -p "Start date (YYYY-MM-DD or leave blank): " start
    read -p "End date (YYYY-MM-DD or leave blank): " end
    read -p "Page number (default 1): " page
    read -p "Limit (default 10): " limit

    local query="?type=$type&startDate=$start&endDate=$end&page=${page:-1}&limit=${limit:-10}"
    make_request "GET" "$USERS_URL/$user_id/activity$query"
}

test_get_all_posts() {
    print_header "Testing GET all posts"
    read -p "Limit (default 10): " limit
    read -p "Offset (default 0): " offset
    make_request "GET" "$POSTS_URL?limit=${limit:-10}&offset=${offset:-0}"
}

test_get_post() {
    print_header "Testing GET post by ID"
    read -p "Enter post ID: " post_id
    make_request "GET" "$POSTS_URL/$post_id"
}

test_create_post() {
    print_header "Testing POST create post"
    read -p "Enter title: " title
    read -p "Enter content: " content
    read -p "Enter author ID: " author_id
    read -p "Enter comma-separated hashtags with space (optional): " hashtags_input

    # Convert comma-separated hashtags to JSON array
    IFS=',' read -ra hashtag_array <<< "$hashtags_input"
    hashtags_json=$(printf '"%s",' "${hashtag_array[@]}")
    hashtags_json="[${hashtags_json%,}]"

    local post_data=$(cat <<EOF
{
    "title": "$title",
    "content": "$content",
    "autherId": $author_id,
    "hashTags": $hashtags_json
}
EOF
)
    make_request "POST" "$POSTS_URL" "$post_data"
}


test_update_post() {
    print_header "Testing PUT update post"
    read -p "Enter post ID to update: " post_id
    read -p "Enter new title (press Enter to keep current): " title
    read -p "Enter new content (press Enter to keep current): " content

    local update_data="{"
    local has_data=false

    if [ -n "$title" ]; then
        update_data+="\"title\": \"$title\""
        has_data=true
    fi
    if [ -n "$content" ]; then
        [ "$has_data" = true ] && update_data+=","
        update_data+="\"content\": \"$content\""
        has_data=true
    fi

    update_data+="}"

    make_request "PUT" "$POSTS_URL/$post_id" "$update_data"
}

test_delete_post() {
    print_header "Testing DELETE post"
    read -p "Enter post ID to delete: " post_id
    make_request "DELETE" "$POSTS_URL/$post_id"
}

test_like_post() {
    print_header "Testing LIKE post"
    read -p "Enter post ID to like: " post_id
    read -p "Enter user ID who likes the post: " user_id

    local data=$(cat <<EOF
{
    "userId": $user_id
}
EOF
)
    make_request "POST" "$POSTS_URL/$post_id/like" "$data"
}

test_unlike_post() {
    print_header "Testing UNLIKE post"
    read -p "Enter post ID to unlike: " post_id
    read -p "Enter user ID who unlikes the post: " user_id

    local data=$(cat <<EOF
{
    "userId": $user_id
}
EOF
)
    make_request "POST" "$POSTS_URL/$post_id/unlike" "$data"
}

test_get_post_likes() {
    print_header "Testing GET post likes"
    read -p "Enter post ID to get likes: " post_id
    make_request "GET" "$POSTS_URL/$post_id/likes"
}

test_get_feed() {
    print_header "Testing GET user feed"
    read -p "Enter user ID to get feed: " user_id
    read -p "Limit (default 10): " limit
    read -p "Offset (default 0): " offset
    make_request "GET" "$POSTS_URL/feed/$user_id?limit=${limit:-10}&offset=${offset:-0}"
}

test_get_posts_by_hashtags() {
    print_header "Testing GET posts by hashtags"
    read -p "Enter comma-separated hashtags (e.g. travel,food): " hashtags
    make_request "GET" "$POSTS_URL/hashtags/$hashtags"
}


show_users_menu() {
    echo -e "\n${GREEN}Users Menu${NC}"
    echo "1. Get all users"
    echo "2. Get user by ID"
    echo "3. Create new user"
    echo "4. Update user"
    echo "5. Delete user"
    echo "6. Follow user"
    echo "7. Unfollow user"
    echo "8. Get followers"
    echo "9. Get user activity"
    echo "10. Back to main menu"
    echo -n "Enter your choice (1-10): "
}

show_posts_menu() {
    echo -e "\n${GREEN}Posts Menu${NC}"
    echo "1. Get all posts"
    echo "2. Get post by ID"
    echo "3. Create new post"
    echo "4. Update post"
    echo "5. Delete post"
    echo "6. Like post"
    echo "7. Unlike post"
    echo "8. Get post likes"
    echo "9. Get user feed"
    echo "10. Get posts by hashtags"
    echo "11. Back to main menu"
    echo -n "Enter your choice (1-11): "
}

show_main_menu() {
    echo -e "\n${GREEN}API Testing Menu${NC}"
    echo "1. Users"
    echo "2. Posts"
    echo "3. Exit"
    echo -n "Enter your choice (1-3): "
}

while true; do
    show_main_menu
    read choice
    case $choice in
        1)
            while true; do
                show_users_menu
                read user_choice
                case $user_choice in
                    1) test_get_all_users ;;
                    2) test_get_user ;;
                    3) test_create_user ;;
                    4) test_update_user ;;
                    5) test_delete_user ;;
                    6) test_follow_user ;;
                    7) test_unfollow_user ;;
                    8) test_get_followers ;;
                    9) test_get_user_activity ;;
                    10) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        2)
            while true; do
                show_posts_menu
                read post_choice
                case $post_choice in
                    1) test_get_all_posts ;;
                    2) test_get_post ;;
                    3) test_create_post ;;
                    4) test_update_post ;;
                    5) test_delete_post ;;
                    6) test_like_post ;;
                    7) test_unlike_post ;;
                    8) test_get_post_likes ;;
                    9) test_get_feed ;;
                    10) test_get_posts_by_hashtags ;;
                    11) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        3) echo "Exiting..."; exit 0 ;;
        *) echo "Invalid choice. Please try again." ;;
    esac
done
