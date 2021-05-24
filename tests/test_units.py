from unittest.mock import Mock

from main import main
from .assertions import assertion


def test_upload_auto():
    """Test the scripts for default/auto mode"""

    data = {}
    req = Mock(get_json=Mock(return_value=data), args=data)
    res = main(req)
    assertion(res)

def test_metrics_manual():
    """Test the scripts for default/auto mode"""

    data = {"day":  1}
    req = Mock(get_json=Mock(return_value=data), args=data)
    res = main(req)
    assertion(res)
