import pytest
import jupyterlab_s3_browser
from moto import mock_s3


#  class TestTest(object):
#  def test_succeed(self):
#  assert True


def test_not_has_aws_s3_role_access_when_unauthenticated():
    if jupyterlab_s3_browser.has_aws_s3_role_access():
        pytest.fail("authenticated")


@mock_s3
def test_has_aws_s3_role_access_when_authenticated():
    if not jupyterlab_s3_browser.has_aws_s3_role_access():
        pytest.fail("not authenticated")
