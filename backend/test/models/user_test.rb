require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "normalizes email and requires a useful password" do
    user = User.new(name: "Tommy", email: "  TOMMY@Example.com ", password: "short")

    assert_not user.valid?
    assert_includes user.errors[:password], "is too short (minimum is 8 characters)"

    user.password = "password123"
    assert user.valid?
    assert_equal "tommy@example.com", user.email
  end
end
