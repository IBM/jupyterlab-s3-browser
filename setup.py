"""
Setup module for the jupyterlab_s3_browser proxy extension
"""
import setuptools
from setupbase import (
    create_cmdclass, ensure_python, find_packages
)

data_files_spec = [
    ('etc/jupyter/jupyter_notebook_config.d',
     'jupyter-config/jupyter_notebook_config.d', 'jupyterlab_s3_browser.json'),
]

cmdclass = create_cmdclass(data_files_spec=data_files_spec)

setup_dict = dict(
    name='jupyterlab_s3_browser',
    description='A Jupyter Notebook server extension which acts a proxy for the S3 API.',
    packages=find_packages(),
    cmdclass=cmdclass,
    author='Jupyter Development Team',
    author_email='jupyter@googlegroups.com',
    url='http://jupyter.org',
    license='Apache 2',
    platforms="Linux, Mac OS X, Windows",
    keywords=['Jupyter', 'JupyterLab', 'S3'],
    python_requires='>=3.5',
    classifiers=[
        'Intended Audience :: Developers',
        'Intended Audience :: Education',
        'Intended Audience :: Science/Research',
        'License :: OSI Approved :: Apache Software License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
    ],
    install_requires=[
        'notebook',
        'boto3',
        'singleton-decorator'
    ]
)

try:
    ensure_python(setup_dict["python_requires"].split(','))
except ValueError as e:
    raise ValueError("{:s}, to use {} you must use python {} ".format(
        e,
        setup_dict["name"],
        setup_dict["python_requires"])
    )

setuptools.setup(
    version='0.1.0',
    **setup_dict
)
