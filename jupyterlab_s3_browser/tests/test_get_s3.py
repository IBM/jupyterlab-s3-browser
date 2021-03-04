import boto3
from moto import mock_s3

import jupyterlab_s3_browser


@mock_s3
def test_get_single_bucket():

    s3 = boto3.resource("s3")
    bucket_name = "test"
    s3.create_bucket(Bucket=bucket_name)

    result = jupyterlab_s3_browser.get_s3_objects_from_path(s3, "/")
    assert result == [{"name": bucket_name, "type": "directory", "path": bucket_name}]


@mock_s3
def test_get_multiple_buckets():

    s3 = boto3.resource("s3")
    bucket_names = ["test1", "test2", "test3"]
    for bucket_name in bucket_names:
        s3.create_bucket(Bucket=bucket_name)

    result = jupyterlab_s3_browser.get_s3_objects_from_path(s3, "/")
    expected_result = [
        {"name": bucket_name, "type": "directory", "path": bucket_name}
        for bucket_name in bucket_names
    ]
    assert result == expected_result


@mock_s3
def test_get_files_inside_bucket():
    print("test")
    s3 = boto3.resource("s3")
    bucket_name = "test"
    s3.create_bucket(Bucket=bucket_name)

    test1 = s3.Object(bucket_name, "test1.txt")
    test1.put(Body="test".encode("utf-8"))

    test2 = s3.Object(bucket_name, "prefix/test2.txt")
    test2.put(Body="test2".encode("utf-8"))

    result = jupyterlab_s3_browser.get_s3_objects_from_path(s3, "/test")
    expected_result = [
        {
            "name": "test1.txt",
            "path": "test/test1.txt",
            "type": "file",
            "mimetype": "json",
        },
        {
            "name": "prefix",
            "path": "test/prefix/",
            "type": "directory",
            "mimetype": "json",
        },
    ]
    print(result)
    assert sorted(result, key=lambda i: i["name"]) == sorted(
        expected_result, key=lambda i: i["name"]
    )
